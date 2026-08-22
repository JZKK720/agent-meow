"""Streaming STT WebSocket endpoint for the Hermes gateway.

Patches ApiServer with POST-adjacent WS route /v1/audio/transcriptions/stream:

  Client → server:
    - binary frames: PCM16 mono 16kHz chunks (raw bytes, little-endian)
    - text frame {"type":"language","language":"zh"} — optional hint
    - text frame {"type":"finalize"} — client VAD says utterance ended;
      server transcribes the full buffer and emits final
    - text frame {"type":"cancel"} — drop the session

  Server → client:
    - {"type":"partial","text":"..."} — sliding-window re-transcription
      while speech is ongoing (fired at most every PARTIAL_INTERVAL_S)
    - {"type":"final","text":"..."} — full-buffer transcript after finalize
    - {"type":"error","message":"..."}

The sliding-window approach re-runs faster-whisper on the growing buffer
every interval — no streaming whisper dependency needed. Partial results
are advisory (client may display them); the final result is authoritative.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import sys
import tempfile
import wave
from typing import Optional

from aiohttp import web

_logger = logging.getLogger("gateway.platforms.api_server_stream_stt")

PARTIAL_INTERVAL_S = 1.0
MIN_PARTIAL_BYTES = 16000  # 0.5s of PCM16 mono 16kHz


def _pcm16_to_wav_bytes(pcm: bytes) -> bytes:
    """Wrap raw PCM16 mono 16kHz bytes in a WAV container."""
    import io

    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(16000)
        w.writeframes(pcm)
    return buf.getvalue()


async def _transcribe_wav(wav_bytes: bytes, language: Optional[str], model: Optional[str]) -> str:
    """Run the shared transcribe_audio helper on WAV bytes; returns text."""
    from tools.transcription_tools import transcribe_audio, LOCAL_STT_LANGUAGE_ENV

    spool = tempfile.NamedTemporaryFile(prefix="hermes-stt-stream-", suffix=".wav", delete=False)
    try:
        spool.write(wav_bytes)
        spool.close()
        old_lang = os.environ.get(LOCAL_STT_LANGUAGE_ENV)
        if language:
            os.environ[LOCAL_STT_LANGUAGE_ENV] = language
        try:
            result = await asyncio.to_thread(transcribe_audio, spool.name, model)
        finally:
            if language:
                if old_lang is not None:
                    os.environ[LOCAL_STT_LANGUAGE_ENV] = old_lang
                else:
                    os.environ.pop(LOCAL_STT_LANGUAGE_ENV, None)
    finally:
        try:
            os.unlink(spool.name)
        except OSError:
            pass
    if not result.get("success"):
        raise RuntimeError(result.get("error", "Transcription failed."))
    return result.get("transcript", "")


async def _handle_audio_transcriptions_stream(self, request: "web.Request") -> "web.WebSocketResponse":
    """WS /v1/audio/transcriptions/stream — streaming STT."""
    auth_err = self._check_auth(request)
    if auth_err is not None:
        return auth_err

    ws = web.WebSocketResponse(max_msg_size=8 * 1024 * 1024)
    await ws.prepare(request)

    buffer = bytearray()
    language: Optional[str] = None
    model: Optional[str] = None
    last_partial_at = 0.0
    partial_task: Optional[asyncio.Task] = None
    cancelled = False

    import time

    async def run_partial() -> None:
        nonlocal last_partial_at
        try:
            text = await _transcribe_wav(_pcm16_to_wav_bytes(bytes(buffer)), language, model)
            if text.strip():
                await ws.send_str(json.dumps({"type": "partial", "text": text}))
            last_partial_at = time.monotonic()
        except Exception as exc:  # partial failures are non-fatal
            _logger.debug("partial transcription failed: %s", exc)
            last_partial_at = time.monotonic()

    try:
        async for msg in ws:
            if msg.type == web.WSMsgType.BINARY:
                buffer.extend(msg.data)
                # Fire a partial at most every interval once we have
                # enough audio to be worth transcribing.
                now = time.monotonic()
                if (
                    len(buffer) >= MIN_PARTIAL_BYTES
                    and now - last_partial_at >= PARTIAL_INTERVAL_S
                    and (partial_task is None or partial_task.done())
                ):
                    partial_task = asyncio.create_task(run_partial())
            elif msg.type == web.WSMsgType.TEXT:
                try:
                    event = json.loads(msg.data)
                except ValueError:
                    continue
                etype = event.get("type")
                if etype == "language":
                    language = event.get("language") or None
                elif etype == "model":
                    model = event.get("model") or None
                elif etype == "finalize":
                    if partial_task is not None:
                        partial_task.cancel()
                    text = await _transcribe_wav(_pcm16_to_wav_bytes(bytes(buffer)), language, model)
                    await ws.send_str(json.dumps({"type": "final", "text": text}))
                    break
                elif etype == "cancel":
                    cancelled = True
                    break
            elif msg.type in (web.WSMsgType.ERROR, web.WSMsgType.CLOSE):
                break
    finally:
        if partial_task is not None and not partial_task.done():
            partial_task.cancel()
    return ws


def install_stream_stt() -> None:
    """Patch APIServerAdapter: add the WS route to the HTTP route table."""
    from gateway.platforms.api_server import APIServerAdapter

    if getattr(APIServerAdapter, "_stream_stt_installed", False):
        return

    APIServerAdapter._handle_audio_transcriptions_stream = _handle_audio_transcriptions_stream
    orig_table = APIServerAdapter._http_route_table

    def _table_with_stream(self):
        routes = orig_table(self)
        routes.append(
            ("GET", "/v1/audio/transcriptions/stream", self._handle_audio_transcriptions_stream)
        )
        return routes

    APIServerAdapter._http_route_table = _table_with_stream
    APIServerAdapter._stream_stt_installed = True
    _logger.info("Streaming STT WS route installed: /v1/audio/transcriptions/stream")


def _install_on_connect() -> None:
    """Patch APIServerAdapter.connect to install the WS route before the
    app is built (the route table is read inside connect)."""
    from gateway.platforms.api_server import APIServerAdapter

    if getattr(APIServerAdapter, "_stream_stt_connect_hooked", False):
        return
    orig_connect = APIServerAdapter.connect

    async def connect_with_stream_stt(self, *args, **kwargs):
        install_stream_stt()
        return await orig_connect(self, *args, **kwargs)

    APIServerAdapter.connect = connect_with_stream_stt
    APIServerAdapter._stream_stt_connect_hooked = True
    _logger.info("Streaming STT connect hook installed")


class _ApiServerImportHook:
    """Meta-path hook: patch APIServerAdapter the moment its module loads."""

    def find_spec(self, fullname, path=None, target=None):
        if fullname != "gateway.platforms.api_server":
            return None
        for finder in sys.meta_path:
            if finder is self:
                continue
            spec_fn = getattr(finder, "find_spec", None)
            if spec_fn is None:
                continue
            found = spec_fn(fullname, path)
            if found is not None and found.loader is not None:
                orig_exec = found.loader.exec_module

                def exec_and_patch(module, _orig=orig_exec):
                    _orig(module)
                    try:
                        _install_on_connect()
                    except Exception:
                        pass

                found.loader.exec_module = exec_and_patch
                return found
        return None


sys.meta_path.insert(0, _ApiServerImportHook())
