#!/usr/bin/env python
"""Standalone launcher for the Hermes voice gateway.

Sets the WindowsSelectorEventLoopPolicy on Windows before importing
agent_meow, then delegates to ``hermes_voice_gateway.main()``.

Usage:
    python scripts/run_voice_gateway.py --port 17494
"""

from __future__ import annotations

import asyncio
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from agent_meow.hermes_voice_gateway import main

if __name__ == "__main__":
    main()
