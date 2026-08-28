"""Tests for the per-agent ``genui`` opt-in (OpenUI Lang prompt injection)."""

from types import SimpleNamespace
from typing import cast

from agent_meow.runtime.prompt import build_instructions
from agent_meow.spec.parser import parse
from agent_meow.spec.types import AgentSpec


def _spec(**kwargs: object) -> AgentSpec:
    """Build a minimal spec stand-in for build_instructions."""
    base: dict[str, object] = {"instructions": "Agent prompt", "skills": []}
    base.update(kwargs)
    return cast(AgentSpec, SimpleNamespace(**base))


def test_genui_false_omits_openui_instructions() -> None:
    result = build_instructions(_spec(), None, [])
    assert "```openui" not in result


def test_genui_true_appends_openui_instructions() -> None:
    result = build_instructions(_spec(genui=True), None, [])
    assert "```openui" in result
    assert "Generative UI" in result


def test_genui_instructions_come_after_agent_prompt() -> None:
    result = build_instructions(_spec(instructions="Agent prompt", genui=True), None, [])
    assert result.index("Agent prompt") < result.index("```openui")


def test_parser_reads_genui_flag(tmp_path) -> None:
    root = tmp_path / "agent"
    root.mkdir()
    (root / "config.yaml").write_text(
        "spec_version: 1\nname: demo\ngenui: true\n",
        encoding="utf-8",
    )
    assert parse(root).genui is True


def test_parser_genui_defaults_false(tmp_path) -> None:
    root = tmp_path / "agent"
    root.mkdir()
    (root / "config.yaml").write_text(
        "spec_version: 1\nname: demo\n",
        encoding="utf-8",
    )
    assert parse(root).genui is False

