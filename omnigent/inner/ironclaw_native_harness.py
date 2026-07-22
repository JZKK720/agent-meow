"""``harness: ironclaw-native`` wrap (the native IronClaw TUI).

Thin module exposing :func:`create_app` — the entry point the shared
:mod:`~?omnigent.runtime.harnesses._runner` invokes after the parent process
resolves ``"ironclaw-native"`` to this module via
:data:`~?omnigent.runtime.harnesses._HARNESS_MODULES`.

Wraps a :class:`~?omnigent.inner.ironclaw_native_executor.IronclawNativeExecutor`, which
injects web-UI messages into the running ``ironclaw`` TUI (launched by
``agent-meow ironclaw`` in the session terminal) via tmux. The bridge dir is read from
:data:`~?omnigent.ironclaw_native_bridge.BRIDGE_DIR_ENV_VAR` in the spawn env.

Tool policies: agent-meow policies are enforced via a per-session ``IRONCLAW_HOME``
that registers a ``pre_tool_call`` shell hook (the same hook the headless
``ironclaw`` harness uses). The runner writes this before launching the TUI (see
:func:`~?omnigent.ironclaw_native_bridge.write_policy_hook_config`). IronClaw's own
in-terminal approval prompt still fires for dangerous commands and is mirrored
to the web UI by :mod:`~?omnigent.ironclaw_native_permissions`.
"""

from __future__ import annotations

from fastapi import FastAPI

from omnigent.inner.executor import Executor
from omnigent.inner.ironclaw_native_executor import IronclawNativeExecutor
from omnigent.runtime.harnesses._executor_adapter import ExecutorAdapter


def _build_ironclaw_native_executor() -> Executor:
    """Construct a :class:`IronclawNativeExecutor` (reads the bridge dir from env)."""
    return IronclawNativeExecutor()


def create_app() -> FastAPI:
    """Build the ironclaw-native harness's FastAPI app (required entry point)."""
    adapter = ExecutorAdapter(executor_factory=_build_ironclaw_native_executor)
    return adapter.build()