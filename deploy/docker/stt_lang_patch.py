"""Patch: _resolve_stt_language must treat 'auto' as no-hint.

Hermes' stock resolver returns the FIRST non-empty candidate, so a config
`stt.language: auto` resolves to the literal string "auto" — which then
gets passed to faster-whisper's model.transcribe(language="auto") (invalid)
and, worse, SHADOWS the per-request HERMES_LOCAL_STT_LANGUAGE hint set by
the streaming-STT WS patch (browser sends {"type":"language","language":"zh"}).
Result: Chinese speech transcribed as English garbage.

Fix: skip candidates equal to "auto" (case-insensitive) so resolution
falls through to the env var / None (whisper auto-detect).

Installed via zzz_stt_lang_patch.pth (container-ephemeral, same pattern
as zzz_stream_stt.pth).
"""
import tools.transcription_tools as _tt

_orig_resolve = _tt._resolve_stt_language


def _resolve_stt_language_auto_aware(provider_key, stt_config=None, *, extra_keys=()):
    """Same as stock, but 'auto' candidates are skipped (treated as unset)."""
    import os

    if stt_config is None:
        stt_config = _tt._load_stt_config()
    provider_cfg = _tt._get_stt_section(stt_config, provider_key)
    candidates = [provider_cfg.get("language")]
    for key in extra_keys:
        candidates.append(provider_cfg.get(key))
    if isinstance(stt_config, dict):
        candidates.append(stt_config.get("language"))
    candidates.append(os.getenv(_tt.LOCAL_STT_LANGUAGE_ENV))
    for candidate in candidates:
        if isinstance(candidate, str) and candidate.strip():
            value = candidate.strip()
            if value.lower() == "auto":
                continue  # 'auto' = no hint — keep looking (env var next)
            return value
    return None


_tt._resolve_stt_language = _resolve_stt_language_auto_aware
print("[stt-lang-patch] _resolve_stt_language is now 'auto'-aware")
