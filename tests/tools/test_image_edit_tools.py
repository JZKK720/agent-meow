"""Tests for the new image_remove_bg / image_edit_ai tool schemas (Phase B3).

Verifies the two new runner-dispatched image tools expose correct names,
descriptions, and OpenAI-format schemas. The runner dispatch (rembg CLI
shell-out, A1111/hosted HTTP) is exercised in tests/e2e/.
"""

from __future__ import annotations

import json

from agent_meow.tools.builtins.images import (
    ImageEditAiTool,
    ImageGenerateTool,
    ImageRemoveBgTool,
)


def test_image_generate_description_no_longer_says_stub() -> None:
    """image_generate is now wired — its description must not say 'stub' or 'v1'."""
    desc = ImageGenerateTool.description()
    assert "stub" not in desc.lower()
    assert "not yet wired" not in desc.lower()


def test_image_remove_bg_tool_name_and_schema() -> None:
    tool = ImageRemoveBgTool()
    assert tool.name() == "image_remove_bg"
    schema = tool.get_schema()
    fn = schema["function"]
    assert fn["name"] == "image_remove_bg"
    params = fn["parameters"]
    assert set(params["required"]) == {"session_id", "image_id"}
    props = params["properties"]
    assert "model" in props
    assert "only_mask" in props
    assert "alpha_matting" in props


def test_image_edit_ai_tool_name_and_schema() -> None:
    tool = ImageEditAiTool()
    assert tool.name() == "image_edit_ai"
    schema = tool.get_schema()
    fn = schema["function"]
    assert fn["name"] == "image_edit_ai"
    params = fn["parameters"]
    assert set(params["required"]) == {"session_id", "image_id", "mode"}
    props = params["properties"]
    assert props["mode"]["enum"] == ["inpaint", "outpaint", "upscale"]
    assert "mask_json" in props
    assert "denoising_strength" in props
    assert "upscale_factor" in props


def test_all_new_image_schemas_are_valid_json() -> None:
    for cls in (ImageRemoveBgTool, ImageEditAiTool):
        schema = cls().get_schema()
        json.dumps(schema)
        assert schema["function"]["name"] == cls.name()
        assert schema["function"]["description"]