"""Launcher for the Hermes voice gateway.

This module exists to set the WindowsSelectorEventLoopPolicy on Windows
BEFORE the ``agent_meow`` package is imported. When running with
``python -m agent_meow.hermes_voice_gateway``, Python first imports the
``agent_meow`` package (``__init__.py``), which transitively imports
modules that may create an event loop before the gateway module's
top-level policy setting runs.

This launcher sets the policy first, then delegates to the real
``hermes_voice_gateway.main()``.

Usage:
    python -m agent_meow.hermes_voice_gateway_main --port 17494
"""

from __future__ import annotations

import asyncio
import sys

# Set the SelectorEventLoop policy on Windows BEFORE importing anything
# from agent_meow. The default ProactorEventLoop is incompatible with
# edge-tts's aiohttp WebSocket transport.
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Now import and run the real gateway
from agent_meow.hermes_voice_gateway import main

if __name__ == "__main__":
    main()
