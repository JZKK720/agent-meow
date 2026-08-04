"""Wrapper to launch the S2S server with voice patches applied.

Usage:
    python -m scripts.run_s2s_with_patches [args passed to speech-to-speech...]

Applies markdown-stripping and any other voice patches from s2s_voice_patch.py,
then delegates to the speech-to-speech CLI entry point.
"""

from __future__ import annotations

import os
import sys

# Apply patches BEFORE the S2S server imports its handlers.
from scripts.s2s_voice_patch import apply_patches

apply_patches()

# Now launch the S2S server's main entry point with the remaining argv.
# We use runpy to run the module as __main__ so it sees sys.argv correctly.
import runpy

sys.argv = ["speech-to-speech"] + sys.argv[1:]
runpy.run_module("speech_to_speech.s2s_pipeline", run_name="__main__", alter_sys=True)
