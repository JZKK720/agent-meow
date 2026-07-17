"""Tests for registry reservation + frozenset wiring of new tool surfaces.

Verifies that the new doc/image/video tool names are reserved as
framework-owned (None) in ``_BUILTIN_REGISTRY`` and appear in the
runner's tool-dispatch frozensets so the dispatch table routes them.
"""

from __future__ import annotations

from agent_meow.runner.tool_dispatch import (
    _ALL_LOCAL_TOOLS,
    _DOC_TOOLS,
    _IMAGE_TOOLS,
    _NATIVE_RELAY_BUILTIN_TOOLS,
    _VIDEO_TOOLS,
)
from agent_meow.tools.builtins import BUILTIN_NAMES, _BUILTIN_REGISTRY


def _assert_framework_owned(name: str) -> None:
    assert name in _BUILTIN_REGISTRY, f"{name} missing from _BUILTIN_REGISTRY"
    assert _BUILTIN_REGISTRY[name] is None, (
        f"{name} should be framework-owned (None), got {_BUILTIN_REGISTRY[name]}"
    )
    assert name in BUILTIN_NAMES


def test_new_doc_tools_reserved_in_registry() -> None:
    for name in ("doc_create_office", "doc_edit_office", "doc_export", "doc_convert"):
        _assert_framework_owned(name)


def test_new_image_tools_reserved_in_registry() -> None:
    for name in ("image_remove_bg", "image_edit_ai"):
        _assert_framework_owned(name)


def test_video_tools_reserved_in_registry() -> None:
    for name in ("video_generate", "video_list", "video_get"):
        _assert_framework_owned(name)


def test_doc_frozenset_includes_new_office_tools() -> None:
    assert {"doc_create_office", "doc_edit_office", "doc_export", "doc_convert"} <= _DOC_TOOLS


def test_image_frozenset_includes_new_edit_tools() -> None:
    assert {"image_remove_bg", "image_edit_ai"} <= _IMAGE_TOOLS


def test_video_frozenset_defined() -> None:
    assert _VIDEO_TOOLS == frozenset({"video_generate", "video_list", "video_get"})


def test_all_new_tools_in_all_local_tools() -> None:
    new_tools = {
        "doc_create_office",
        "doc_edit_office",
        "doc_export",
        "doc_convert",
        "image_remove_bg",
        "image_edit_ai",
        "video_generate",
        "video_list",
        "video_get",
    }
    assert new_tools <= _ALL_LOCAL_TOOLS


def test_all_new_tools_in_native_relay_builtin_tools() -> None:
    new_tools = {
        "doc_create_office",
        "doc_edit_office",
        "doc_export",
        "doc_convert",
        "image_remove_bg",
        "image_edit_ai",
        "video_generate",
        "video_list",
        "video_get",
    }
    assert new_tools <= _NATIVE_RELAY_BUILTIN_TOOLS