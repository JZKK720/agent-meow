"""Helpers for agent-meow-prefixed credential environment variables."""

from __future__ import annotations

import os
import re
from collections.abc import Mapping

AGENT_MEOW_ENV_PREFIX = "AGENT_MEOW_"
# Legacy prefix from the omnigent era — kept as fallback so existing
# deployments with OMNIGENT_* env vars continue to work. Remove in a
# future release once all users have migrated to AGENT_MEOW_*.
OMNIGENT_ENV_PREFIX_LEGACY = "AGENT_MEOW_"

_ENV_REF_RE = re.compile(r"(?<!\$)\$(?:\{([A-Za-z_][A-Za-z0-9_]*)\}|([A-Za-z_][A-Za-z0-9_]*))")


def agent_meow_prefixed_env_name(name: str) -> str:
    """Return the agent-meow-prefixed alias for *name*.

    :param name: Environment variable name, e.g. ``"ANTHROPIC_API_KEY"``.
    :returns: ``"AGENT_MEOW_ANTHROPIC_API_KEY"`` unless *name* is already
        agent-meow-prefixed.
    """
    return name if name.startswith(AGENT_MEOW_ENV_PREFIX) else f"{AGENT_MEOW_ENV_PREFIX}{name}"


def env_names_with_agent_meow_prefix(name: str) -> tuple[str, ...]:
    """Return the canonical env var name plus its agent-meow-prefixed alias.

    The canonical name stays first so existing deployments keep precedence
    when both names are set.

    :param name: Environment variable name, e.g. ``"OPENAI_API_KEY"``.
    :returns: Candidate names in resolution order.
    """
    prefixed = agent_meow_prefixed_env_name(name)
    if prefixed == name:
        return (name,)
    return (name, prefixed)


def getenv_with_agent_meow_prefix(
    name: str, environ: Mapping[str, str] | None = None
) -> tuple[str, str] | None:
    """Read *name*, falling back to ``AGENT_MEOW_<name>`` when unset.

    :param name: Canonical environment variable name.
    :param environ: Optional environment mapping; defaults to ``os.environ``.
    :returns: ``(actual_name, value)`` for the first set candidate, or
        ``None`` when neither exists.
    """
    env = os.environ if environ is None else environ
    for candidate in env_names_with_agent_meow_prefix(name):
        value = env.get(candidate)
        if value is not None:
            return candidate, value
    return None


def getenv_nonempty_with_agent_meow_prefix(
    name: str, environ: Mapping[str, str] | None = None
) -> tuple[str, str] | None:
    """Read a non-empty env var with ``AGENT_MEOW_`` fallback.

    :param name: Canonical environment variable name.
    :param environ: Optional environment mapping; defaults to ``os.environ``.
    :returns: ``(actual_name, value)`` for the first non-empty candidate, or
        ``None`` when neither candidate has a non-blank value.
    """
    env = os.environ if environ is None else environ
    for candidate in env_names_with_agent_meow_prefix(name):
        value = env.get(candidate)
        if value is not None and value.strip():
            return candidate, value
    return None


def expand_envvars_with_agent_meow_prefix(value: str) -> str:
    """Expand ``$VAR`` references with ``AGENT_MEOW_VAR`` fallback.

    This mirrors ``os.path.expandvars`` for credential paths that already
    support ``$VAR`` references, with one extra rule: if ``VAR`` is unset but
    ``AGENT_MEOW_VAR`` is set, the prefixed value is used. Unresolved references
    are left intact so the caller's existing unresolved-var check can produce
    its normal error.

    :param value: String that may contain shell-style env references.
    :returns: Expanded string.
    """

    def _replace(match: re.Match[str]) -> str:
        name = match.group(1) or match.group(2)
        resolved = getenv_with_agent_meow_prefix(name)
        return resolved[1] if resolved is not None else match.group(0)

    return _ENV_REF_RE.sub(_replace, value)


# ── Legacy aliases (backward compat for OMNIGENT_* env vars) ──────────
# These keep existing deployments working. They try AGENT_MEOW_* first,
# then fall back to OMNIGENT_*.

def _getenv_with_legacy_fallback(
    name: str, environ: Mapping[str, str] | None = None
) -> tuple[str, str] | None:
    """Read *name*, trying AGENT_MEOW_* prefix, then OMNIGENT_* prefix."""
    env = os.environ if environ is None else environ
    # Try AGENT_MEOW_ prefix first
    result = getenv_with_agent_meow_prefix(name, env)
    if result is not None:
        return result
    # Fall back to OMNIGENT_ prefix
    legacy_name = f"{OMNIGENT_ENV_PREFIX_LEGACY}{name}"
    legacy_val = env.get(legacy_name)
    if legacy_val is not None:
        return legacy_name, legacy_val
    return None


def _getenv_nonempty_with_legacy_fallback(
    name: str, environ: Mapping[str, str] | None = None
) -> tuple[str, str] | None:
    """Read a non-empty env var with AGENT_MEOW_ then OMNIGENT_ fallback."""
    env = os.environ if environ is None else environ
    result = getenv_nonempty_with_agent_meow_prefix(name, env)
    if result is not None:
        return result
    legacy_name = f"{OMNIGENT_ENV_PREFIX_LEGACY}{name}"
    legacy_val = env.get(legacy_name)
    if legacy_val is not None and legacy_val.strip():
        return legacy_name, legacy_val
    return None
