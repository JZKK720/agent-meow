"""Monkeypatch the speech-to-speech package for local voice-stack use.

Three patches are applied:

1. **Markdown strip** — the S2S ``remove_unspeechable`` keeps ``*`` as a
   "speechable" character, but Kokoro TTS reads ``*`` literally as "asterisk"
   so LLM responses with markdown bold produce audible "asterisk asterisk"
   noise. Strips ``*``, ``_``, ``#``, backticks after the original runs.

2. **Non-fatal warmup** — the LLM handler's ``warmup()`` makes a synchronous
   blocking API call to the LLM backend. When the backend (e.g. Hermes in
   Docker) is slow or temporarily unreachable, the warmup times out and
   crashes the entire S2S server before it ever starts listening. This patch
   wraps warmup in a try/except so the server starts regardless; the first
   real request will surface any persistent backend issues.

3. **Extended request timeout** — the default 20 s timeout is too short for
   a local LLM gateway running inside Docker/WSL. Bumped to 120 s so the
   warmup and real requests have time to complete.

Loaded automatically via ``sitecustomize.py`` when the S2S server starts,
or imported explicitly from the startup wrapper
(``scripts/run_s2s_with_patches.py``).
"""

from __future__ import annotations

import logging
import re

_log = logging.getLogger(__name__)

# Markdown formatting characters that TTS should NOT read aloud.
# These are stripped AFTER the original remove_unspeechable runs.
_MARKDOWN_STRIP_PATTERN = re.compile(r"[*_`#]+")

# Extended request timeout for local LLM gateways (e.g. Hermes in Docker).
# The S2S default of 20 s is too short for model loading / cold starts.
_EXTENDED_REQUEST_TIMEOUT_S = 120.0

# Capture the ORIGINAL remove_unspeechable BEFORE patching — must be done
# at import time, before apply_patches() replaces it in the module.
_original_remove_unspeechable = None


def _patched_remove_unspeechable(text: str) -> str:
    """Wrap the original remove_unspeechable, then strip markdown chars."""
    global _original_remove_unspeechable
    if _original_remove_unspeechable is None:
        # Late import to avoid circular dependency at module load time.
        from speech_to_speech.LLM import utils as _s2s_utils

        # The module-level remove_unspeechable may already be patched by
        # a previous apply_patches() call. Walk back to the original via
        # __wrapped__ if set, otherwise use the current one.
        fn = _s2s_utils.remove_unspeechable
        _original_remove_unspeechable = getattr(fn, "__wrapped__", fn)

    cleaned = _original_remove_unspeechable(text)
    # Strip markdown formatting characters that Kokoro would read aloud.
    cleaned = _MARKDOWN_STRIP_PATTERN.sub("", cleaned)
    return cleaned


def _patch_warmup_and_timeout() -> None:
    """Patch LLM warmup to be non-fatal and extend the request timeout.

    The S2S server calls ``warmup()`` during handler construction (inside
    ``setup()``). If the LLM backend is slow or unreachable, the warmup
    raises ``openai.APITimeoutError`` which propagates up through
    ``build_pipeline()`` and crashes the entire server before it ever
    binds to port 8765. Wrapping warmup in a try/except lets the server
    start — the first real request will surface any persistent backend
    issue as a normal error event instead of a startup crash.

    Also bumps ``request_timeout_s`` from the 20 s default to
    ``_EXTENDED_REQUEST_TIMEOUT_S`` so requests to a local LLM gateway
    (Hermes in Docker/WSL) have time to complete.
    """
    import speech_to_speech.LLM.base_openai_compatible_language_model as s2s_base

    # ── Patch setup() to use a longer timeout ──────────────────────────
    _orig_setup = s2s_base.BaseOpenAICompatibleHandler.setup

    if not getattr(_orig_setup, "_voice_patched", False):

        def _patched_setup(self, *args, **kwargs):
            # Override the default timeout if the caller didn't specify one.
            if "request_timeout_s" not in kwargs:
                kwargs["request_timeout_s"] = _EXTENDED_REQUEST_TIMEOUT_S
            return _orig_setup(self, *args, **kwargs)

        _patched_setup.__wrapped__ = _orig_setup  # type: ignore[attr-defined]
        _patched_setup._voice_patched = True  # type: ignore[attr-defined]
        s2s_base.BaseOpenAICompatibleHandler.setup = _patched_setup

    # ── Patch warmup() to be non-fatal ─────────────────────────────────
    # Each subclass (ChatCompletions, ResponsesApi) inherits warmup from
    # the base or overrides it. Patch at the base level so all subclasses
    # benefit. The subclass warmups call self.client.chat.completions.create
    # or self.client.responses.create — we just need to catch the timeout.
    _orig_warmup = s2s_base.BaseOpenAICompatibleHandler.warmup

    if not getattr(_orig_warmup, "_voice_patched", False):

        def _patched_warmup(self):
            try:
                _orig_warmup(self)
            except Exception as exc:
                _log.warning(
                    "LLM warmup failed (server will start anyway, first "
                    "real request will retry): %s: %s",
                    type(exc).__name__,
                    exc,
                )

        _patched_warmup.__wrapped__ = _orig_warmup  # type: ignore[attr-defined]
        _patched_warmup._voice_patched = True  # type: ignore[attr-defined]
        s2s_base.BaseOpenAICompatibleHandler.warmup = _patched_warmup

    # Also patch the ChatCompletions subclass warmup (it overrides the base).
    try:
        import speech_to_speech.LLM.chat_completions_language_model as s2s_chat

        _orig_chat_warmup = s2s_chat.ChatCompletionsApiModelHandler.warmup

        if not getattr(_orig_chat_warmup, "_voice_patched", False):

            def _patched_chat_warmup(self):
                try:
                    _orig_chat_warmup(self)
                except Exception as exc:
                    _log.warning(
                        "ChatCompletions LLM warmup failed (server will start anyway): %s: %s",
                        type(exc).__name__,
                        exc,
                    )

            _patched_chat_warmup.__wrapped__ = _orig_chat_warmup  # type: ignore[attr-defined]
            _patched_chat_warmup._voice_patched = True  # type: ignore[attr-defined]
            s2s_chat.ChatCompletionsApiModelHandler.warmup = _patched_chat_warmup
    except ImportError:
        pass  # chat_completions module not available — base patch covers it


def apply_patches() -> None:
    """Apply all S2S voice patches. Safe to call multiple times."""
    import speech_to_speech.LLM.utils as s2s_utils
    import speech_to_speech.LLM.base_openai_compatible_language_model as s2s_base

    # Capture the original BEFORE patching (idempotent — only capture once).
    global _original_remove_unspeechable
    if _original_remove_unspeechable is None:
        _original_remove_unspeechable = s2s_utils.remove_unspeechable

    # Patch 1: strip markdown formatting characters from TTS input.
    if not getattr(s2s_utils.remove_unspeechable, "_voice_patched", False):
        _patched = _patched_remove_unspeechable
        _patched.__wrapped__ = _original_remove_unspeechable  # type: ignore[attr-defined]
        _patched._voice_patched = True  # type: ignore[attr-defined]
        s2s_utils.remove_unspeechable = _patched

    # The base handler imports remove_unspeechable by name at module level,
    # so re-bind it there too.
    if not getattr(s2s_base.remove_unspeechable, "_voice_patched", False):
        s2s_base.remove_unspeechable = s2s_utils.remove_unspeechable

    # Patch 2 + 3: non-fatal warmup and extended request timeout.
    _patch_warmup_and_timeout()


# Auto-apply when imported.
apply_patches()
