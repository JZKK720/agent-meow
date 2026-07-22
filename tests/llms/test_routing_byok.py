"""Tests for BYOK provider routing (Z.ai, Qwen).

These providers are OpenAI-compatible and were added for the ColorFire
deployment alongside local OSS models (hermes-native, ironclaw-native).
See docs/superpowers/specs/2026-07-22-workspace-reintegration-design.md
Appendix C for the API docs research that confirmed compatibility.
"""

from omnigent.llms.routing import PROVIDER_CONFIGS, parse_model_string


def test_zai_provider_registered():
    assert "zai" in PROVIDER_CONFIGS
    assert PROVIDER_CONFIGS["zai"] == "https://api.z.ai/api/paas/v4"


def test_qwen_provider_registered():
    assert "qwen" in PROVIDER_CONFIGS
    assert PROVIDER_CONFIGS["qwen"] == "https://dashscope.aliyuncs.com/compatible-mode/v1"


def test_zai_model_parses():
    result = parse_model_string("zai/glm-5.2")
    assert result.provider == "zai"
    assert result.model == "glm-5.2"


def test_qwen_model_parses():
    result = parse_model_string("qwen/qwen-plus")
    assert result.provider == "qwen"
    assert result.model == "qwen-plus"