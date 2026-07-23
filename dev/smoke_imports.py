"""Smoke test: verify agent_meow package imports correctly after the merge."""
import sys

print(f"Python: {sys.version}")

# Test the main package imports
try:
    import agent_meow
    print(f"OK: import agent_meow (version={getattr(agent_meow, '__version__', '?')})")
except Exception as e:
    print(f"FAIL: import agent_meow: {e!r}")
    sys.exit(1)

# Test the compat shim
try:
    import omnigent
    print(f"OK: import omnigent (compat shim -> {omnigent.__name__})")
except Exception as e:
    print(f"FAIL: import omnigent compat shim: {e!r}")

# Test key submodules
modules = [
    "agent_meow.cli",
    "agent_meow.server.app",
    "agent_meow.runner.app",
    "agent_meow.chat",
    "agent_meow.config",
    "agent_meow.cli_native",
    "agent_meow.process_logging",
    "agent_meow.telemetry",
    "agent_meow.session_import",
    "agent_meow.stores.project_store",
    "agent_meow.stores.scheduled_task_store",
    "agent_meow.api.routing",
]
failures = 0
for mod in modules:
    try:
        __import__(mod)
        print(f"OK: import {mod}")
    except Exception as e:
        print(f"FAIL: import {mod}: {e!r}")
        failures += 1

print(f"\n{'ALL OK' if failures == 0 else f'{failures} FAILURES'}")
sys.exit(0 if failures == 0 else 1)
