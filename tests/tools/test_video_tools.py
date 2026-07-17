"""Tests for the new video_* tool schemas (Phase C1).

Verifies the three new runner-dispatched video tools expose correct names,
descriptions, and OpenAI-format schemas.
"""

from __future__ import annotations

import json

from agent_meow.tools.builtins.videos import (
    VideoGenerateTool,
    VideoGetTool,
    VideoListTool,
)


def test_video_generate_tool_name_and_schema() -> None:
    tool = VideoGenerateTool()
    assert tool.name() == "video_generate"
    schema = tool.get_schema()
    fn = schema["function"]
    assert fn["name"] == "video_generate"
    params = fn["parameters"]
    assert set(params["required"]) == {"session_id", "text"}
    props = params["properties"]
    assert props["mode"]["enum"] == ["generate", "fixed"]
    assert "n_scenes" in props
    assert "aspect_ratio" in props
    assert "frame_template" in props


def test_video_list_tool_name_and_schema() -> None:
    tool = VideoListTool()
    assert tool.name() == "video_list"
    schema = tool.get_schema()
    fn = schema["function"]
    assert fn["name"] == "video_list"
    params = fn["parameters"]
    assert set(params["required"]) == {"session_id"}


def test_video_get_tool_name_and_schema() -> None:
    tool = VideoGetTool()
    assert tool.name() == "video_get"
    schema = tool.get_schema()
    fn = schema["function"]
    assert fn["name"] == "video_get"
    params = fn["parameters"]
    assert set(params["required"]) == {"session_id", "video_id"}


def test_all_video_schemas_are_valid_json() -> None:
    for cls in (VideoGenerateTool, VideoListTool, VideoGetTool):
        schema = cls().get_schema()
        json.dumps(schema)
        assert schema["function"]["name"] == cls.name()
        assert schema["function"]["description"]