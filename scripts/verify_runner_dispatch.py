"""Verify runner dispatch plan (Plan 003) is fully implemented."""

# Step 1: Builtin names registered
from agent_meow.tools.builtins import BUILTIN_NAMES

checks_step1 = [
    ("doc_create", "doc_create" in BUILTIN_NAMES),
    ("video_generate", "video_generate" in BUILTIN_NAMES),
    ("speak", "speak" in BUILTIN_NAMES),
    ("image_generate", "image_generate" in BUILTIN_NAMES),
    ("transcribe_audio", "transcribe_audio" in BUILTIN_NAMES),
]
print("Step 1 — Builtin registry:")
for name, ok in checks_step1:
    print(f"  {'✅' if ok else '❌'} {name}")
    assert ok, f"{name} not in BUILTIN_NAMES"

# Step 2: Frozensets in tool_dispatch
from agent_meow.runner.tool_dispatch import (
    _ALL_LOCAL_TOOLS,
    _DOC_TOOLS,
    _IMAGE_TOOLS,
    _VIDEO_TOOLS,
    _VOICE_TOOLS,
    _NATIVE_RELAY_BUILTIN_TOOLS,
)

checks_step2 = [
    ("doc_create in _ALL_LOCAL_TOOLS", "doc_create" in _ALL_LOCAL_TOOLS),
    ("video_generate in _ALL_LOCAL_TOOLS", "video_generate" in _ALL_LOCAL_TOOLS),
    ("speak in _ALL_LOCAL_TOOLS", "speak" in _ALL_LOCAL_TOOLS),
    ("image_generate in _ALL_LOCAL_TOOLS", "image_generate" in _ALL_LOCAL_TOOLS),
    ("doc_create in _NATIVE_RELAY", "doc_create" in _NATIVE_RELAY_BUILTIN_TOOLS),
    ("video_generate in _NATIVE_RELAY", "video_generate" in _NATIVE_RELAY_BUILTIN_TOOLS),
]
print("\nStep 2 — Dispatch frozensets:")
for name, ok in checks_step2:
    print(f"  {'✅' if ok else '❌'} {name}")
    assert ok, f"{name} failed"

# Step 3: Dispatch functions exist
from agent_meow.runner.tool_dispatch import (
    _execute_doc_tool,
    _execute_image_tool,
    _execute_video_tool,
    _execute_voice_tool,
)

print("\nStep 3 — Dispatch functions:")
print(f"  ✅ _execute_doc_tool")
print(f"  ✅ _execute_image_tool")
print(f"  ✅ _execute_video_tool")
print(f"  ✅ _execute_voice_tool")

# Step 4: Dispatch branches exist (grep the main dispatch function)
import inspect
from agent_meow.runner import tool_dispatch

source = inspect.getsource(tool_dispatch)
checks_step4 = [
    ("_DOC_TOOLS branch", "elif tool_name in _DOC_TOOLS:" in source),
    ("_IMAGE_TOOLS branch", "elif tool_name in _IMAGE_TOOLS:" in source),
    ("_VIDEO_TOOLS branch", "elif tool_name in _VIDEO_TOOLS:" in source),
    ("_VOICE_TOOLS branch", "elif tool_name in _VOICE_TOOLS:" in source),
]
print("\nStep 4 — Dispatch branches:")
for name, ok in checks_step4:
    print(f"  {'✅' if ok else '❌'} {name}")
    assert ok, f"{name} missing"

print("\n🎉 Plan 003 is FULLY IMPLEMENTED — all runner dispatch is wired.")