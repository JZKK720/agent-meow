"""IronClaw readiness + config reporting for ``agent-meow setup``.

Like :mod:`~?omnigent.onboarding.hermes_auth`, agent-meow manages **no** IronClaw
credentials: IronClaw owns its own auth via ``ironclaw config`` (an interactive
provider/model picker) which writes the chosen provider + model into
``~/.ironclaw/config.yaml``. This module is a thin, read-only reporter — it
confirms the ``ironclaw`` binary is installed and surfaces the configured
provider/model so ``agent-meow setup`` can show IronClaw as ready (and which model
it will drive) instead of always reading "Not configured" on an installed
binary.

Detection reads ``~/.ironclaw/config.yaml`` directly — the same user config the
native bridge copies forward in
:func:`~?omnigent.ironclaw_native_bridge._load_user_ironclaw_config`. A fresh install
ships ``model.provider: auto`` (auto-detect from credentials — nothing picked
yet); a finished ``ironclaw config`` run replaces that with a concrete provider id
(e.g. ``openrouter``). So "configured" is a concrete, non-``auto`` provider,
which cleanly distinguishes a completed ``ironclaw config`` run from an untouched
scaffold. As with Hermes, a bad/absent credential surfaces at run time via
IronClaw's own error — the daemon's launch gate (:mod:`harness_readiness`)
deliberately fails open — so this reporter gates only on the picked provider,
never on credential resolution it cannot reliably enumerate.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from omnigent.onboarding.harness_install import IRONCLAW_KEY, harness_cli_installed

#: Provider value IronClaw ships in a fresh ``config.yaml``. ``"auto"`` means
#: "auto-detect from credentials", i.e. the user has not picked a provider via
#: ``ironclaw config`` yet — treated as not-configured for the setup overview.
_AUTO_PROVIDER = "auto"


def ironclaw_cli_installed() -> bool:
    """Return whether the ``ironclaw`` binary is on ``PATH``."""
    return harness_cli_installed(IRONCLAW_KEY)


def ironclaw_config_path() -> Path:
    """Return the user's IronClaw config path (``~/.ironclaw/config.yaml``)."""
    return Path.home() / ".ironclaw" / "config.yaml"


@dataclass(frozen=True)
class IronclawConfigSummary:
    """What setup needs to know about the local IronClaw configuration.

    :param installed: ``ironclaw`` binary present on ``PATH``.
    :param provider: Configured ``model.provider`` (a concrete provider id),
        or ``None`` when unset, empty, or still the ``auto`` scaffold default.
    :param model: Configured ``model.default`` model id, or ``None``.
    """

    installed: bool
    provider: str | None
    model: str | None

    @property
    def ready(self) -> bool:
        """Configured once a concrete provider has been picked via ``ironclaw config``.

        A fresh install ships ``provider: auto`` (nothing chosen); a finished
        ``ironclaw config`` run writes a concrete provider id. Gate on the binary
        too so an absent CLI never reads as ready.
        """
        return self.installed and self.provider is not None

    def describe(self) -> str:
        """Return a one-line status for the setup overview.

        e.g. ``"openrouter / z-ai/glm-5.2"`` when both are known, else whichever
        of provider/model is set, falling back to ``"Configured"``.
        """
        if self.provider and self.model:
            return f"{self.provider} / {self.model}"
        return self.provider or self.model or "Configured"


def _model_section() -> dict:
    """Return the ``model`` mapping from ``~/.ironclaw/config.yaml`` (best-effort).

    Returns ``{}`` on a missing file, parse failure, or a non-mapping top-level
    document / ``model`` value — this is read-only reporting and must never
    raise.
    """
    path = ironclaw_config_path()
    try:
        import yaml

        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError):
        return {}
    if not isinstance(data, dict):
        return {}
    model = data.get("model")
    return model if isinstance(model, dict) else {}


def ironclaw_config_summary() -> IronclawConfigSummary:
    """Summarize the local IronClaw configuration for the setup overview.

    Reads ``model.provider`` (reported as ``None`` when unset, empty, or the
    ``auto`` scaffold default) and the selected model id (``model.default``,
    accepting the ``model.model`` alternate spelling IronClaw also honors).
    """
    section = _model_section()
    raw_provider = section.get("provider")
    provider = raw_provider.strip() if isinstance(raw_provider, str) else ""
    if provider.lower() == _AUTO_PROVIDER:
        provider = ""
    raw_model = section.get("default") or section.get("model")
    model = raw_model.strip() if isinstance(raw_model, str) else ""
    return IronclawConfigSummary(
        installed=ironclaw_cli_installed(),
        provider=provider or None,
        model=model or None,
    )