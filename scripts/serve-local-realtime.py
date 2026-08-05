#!/usr/bin/env python3
"""Local realtime orchestrator — replaces S2S entirely.

WebSocket server on :8890 that speaks the OpenAI Realtime API protocol.
Receives audio from QAA, routes through:
  1. Qwen3-ASR (:8888) for STT
  2. Hermes ACP (:8642) for LLM (with 橘宝 persona)
  3. Qwen3-TTS (:8889) for TTS

QAA connects to this as its "speech-to-speech" provider.
No S2S, no faster-whisper, no Kokoro — fully replaced.
"""
import argparse
import asyncio
import base64
import json
import logging
import os
import sys
import time
from typing import Set

import websockets
import httpx

logger = logging.getLogger("local-realtime")

# ── Config ──────────────────────────────────────────────────────────
ASR_URL = os.environ.get("QWEN3_ASR_URL", "http://127.0.0.1:8888")
TTS_URL = os.environ.get("QWEN3_TTS_URL", "http://127.0.0.1:8889")
HERMES_URL = os.environ.get("HERMES_URL", "http://127.0.0.1:8642/v1")
HERMES_MODEL = os.environ.get("HERMES_MODEL", "qwen3.6:35b-a3b-q8_0")
HERMES_API_KEY = os.environ.get("HERMES_API_KEY", "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb")

# 橘宝 persona — same as Hermes agent.system_prompt
SYSTEM_PROMPT = """I am 橘宝 (Jubao / MEOW), a friendly evolved orange-cat AI assistant.
I am NOT Hermes or Qwen. Hermes Agent is my platform, not my name.
Language: English in -> English out, Chinese in -> Chinese out. Never mix.
I stay in character as 橘宝 always.
Professional with cat humor. Short answers first, expand when needed."""

# ── Audio constants ─────────────────────────────────────────────────
INPUT_SAMPLE_RATE = 16000  # QAA sends 16kHz PCM16
OUTPUT_SAMPLE_RATE = 24000  # Qwen3-TTS outputs 24kHz PCM16

# ── Pipeline ──────────────────────────────────────────────────────

async def transcribe_audio(audio_bytes: bytes) -> dict:
    """Send audio to Qwen3-ASR server for transcription."""
    audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{ASR_URL}/v1/asr",
            json={"audio": audio_b64, "sample_rate": INPUT_SAMPLE_RATE},
        )
        resp.raise_for_status()
        return resp.json()

async def llm_respond(text: str, history: list = None) -> str:
    """Send text to Hermes ACP for LLM response with 橘宝 persona."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": text})

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{HERMES_URL}/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {HERMES_API_KEY}",
            },
            json={
                "model": HERMES_MODEL,
                "messages": messages,
                "stream": False,
                "max_tokens": 512,
                "temperature": 0.7,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()

async def synthesize_speech(text: str, voice: str = "Cherry") -> bytes:
    """Send text to Qwen3-TTS server for speech synthesis."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{TTS_URL}/v1/tts",
            json={"text": text, "voice": voice},
        )
        resp.raise_for_status()
        data = resp.json()
        audio_b64 = data.get("audio", "")
        if not audio_b64:
            return b""
        return base64.b64decode(audio_b64)

# ── WebSocket handler ──────────────────────────────────────────────

async def handle_connection(websocket, path=None):
    """Handle a QAA realtime WebSocket connection."""
    logger.info(f"Client connected: {websocket.remote_address}")

    # Per-session state
    audio_buffer = bytearray()
    conversation_history = []
    is_processing = False

    async for message in websocket:
        try:
            event = json.loads(message)
            event_type = event.get("type", "")

            if event_type == "session.update":
                # QAA sends session config — accept and echo
                session = event.get("session", {})
                logger.info(f"Session update: {json.dumps(session)[:200]}")

                # Echo back session.created
                await websocket.send(json.dumps({
                    "type": "session.created",
                    "session": {
                        "id": "local-realtime",
                        "voice": session.get("voice", "Cherry"),
                        "modalities": ["text", "audio"],
                        "input_audio_format": "pcm16",
                        "output_audio_format": "pcm16",
                        "turn_detection": {"type": "server_vad"},
                    },
                }))

            elif event_type == "input_audio_buffer.append":
                # Accumulate audio chunks
                audio_b64 = event.get("audio", "")
                if audio_b64:
                    audio_buffer.extend(base64.b64decode(audio_b64))

            elif event_type == "input_audio_buffer.commit":
                # User finished speaking — run the pipeline
                if is_processing or len(audio_buffer) == 0:
                    continue

                is_processing = True
                try:
                    audio_bytes = bytes(audio_buffer)
                    audio_buffer.clear()

                    # 1. STT: Qwen3-ASR
                    logger.info(f"Transcribing {len(audio_bytes)} bytes...")
                    asr_result = await transcribe_audio(audio_bytes)
                    user_text = asr_result.get("text", "").strip()
                    logger.info(f"STT result: '{user_text}'")

                    if not user_text:
                        await websocket.send(json.dumps({
                            "type": "error",
                            "error": {"type": "transcription_error", "message": "Empty transcription"},
                        }))
                        continue

                    # Send user transcript
                    await websocket.send(json.dumps({
                        "type": "conversation.item.input_audio_transcription.completed",
                        "item_id": f"item_{int(time.time()*1000)}",
                        "transcript": user_text,
                    }))

                    # 2. LLM: Hermes ACP (ALL LLM goes through Hermes)
                    logger.info(f"LLM via Hermes ({HERMES_MODEL})...")
                    response_text = await llm_respond(user_text, conversation_history)

                    # Update conversation history
                    conversation_history.append({"role": "user", "content": user_text})
                    conversation_history.append({"role": "assistant", "content": response_text})

                    # Send assistant transcript
                    await websocket.send(json.dumps({
                        "type": "response.audio_transcript.delta",
                        "response_id": f"resp_{int(time.time()*1000)}",
                        "item_id": f"item_{int(time.time()*1000)+1}",
                        "delta": response_text,
                    }))
                    await websocket.send(json.dumps({
                        "type": "response.audio_transcript.done",
                        "response_id": f"resp_{int(time.time()*1000)}",
                        "item_id": f"item_{int(time.time()*1000)+1}",
                        "transcript": response_text,
                    }))

                    # 3. TTS: Qwen3-TTS
                    logger.info(f"TTS via Qwen3-TTS...")
                    audio_data = await synthesize_speech(response_text)

                    if audio_data:
                        # Send audio delta
                        audio_b64 = base64.b64encode(audio_data).decode("utf-8")
                        await websocket.send(json.dumps({
                            "type": "response.output_audio.delta",
                            "response_id": f"resp_{int(time.time()*1000)}",
                            "item_id": f"item_{int(time.time()*1000)+1}",
                            "delta": audio_b64,
                        }))
                        await websocket.send(json.dumps({
                            "type": "response.output_audio.done",
                            "response_id": f"resp_{int(time.time()*1000)}",
                            "item_id": f"item_{int(time.time()*1000)+1}",
                            "audio": audio_b64,
                        }))

                    # Response done
                    await websocket.send(json.dumps({
                        "type": "response.done",
                        "response": {"id": f"resp_{int(time.time()*1000)}", "status": "completed"},
                    }))

                    logger.info(f"Pipeline complete: '{user_text}' -> '{response_text[:50]}...'")

                except Exception as e:
                    logger.error(f"Pipeline error: {e}")
                    await websocket.send(json.dumps({
                        "type": "error",
                        "error": {"type": "pipeline_error", "message": str(e)},
                    }))
                finally:
                    is_processing = False

            elif event_type == "response.create":
                # Manual response trigger — not needed with server VAD
                pass

            elif event_type == "error":
                logger.error(f"Client error: {event.get('error', event)}")

        except json.JSONDecodeError:
            logger.warning(f"Invalid JSON: {message[:100]}")
        except Exception as e:
            logger.error(f"Handler error: {e}")

    logger.info(f"Client disconnected: {websocket.remote_address}")

# ── Main ────────────────────────────────────────────────────────────

async def main():
    parser = argparse.ArgumentParser(description="Local realtime orchestrator")
    parser.add_argument("--port", type=int, default=8890)
    parser.add_argument("--host", type=str, default="127.0.0.1")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        datefmt="%H:%M:%S",
    )

    logger.info(f"ASR server: {ASR_URL}")
    logger.info(f"TTS server: {TTS_URL}")
    logger.info(f"Hermes URL: {HERMES_URL}")
    logger.info(f"Hermes model: {HERMES_MODEL}")
    logger.info(f"Starting local-realtime orchestrator on ws://{args.host}:{args.port}")

    async with websockets.serve(handle_connection, args.host, args.port):
        logger.info("Server ready — waiting for QAA connections...")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())