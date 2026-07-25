---
description: "OpenMontage video production skill for agent-meow. Use when: user wants to create, produce, generate, or edit any video content — trailers, explainers, clips, animations, documentaries, talking-head videos, screen demos, or podcasts."
applyTo: "**"
---

# OpenMontage — Agent-Meow Video Production Skill

OpenMontage (at `C:\Users\1\github-pr\OpenMontage`) is a full agentic video production system. You drive it by reading pipeline manifests and stage director skills, then calling its Python tools.

## Rule Zero — All Production Goes Through a Pipeline

Every video production request MUST go through the pipeline system. No exceptions.

## Quick Start

1. **Read the onboarding skill**: `C:\Users\1\github-pr\OpenMontage\skills\meta\onboarding.md`
2. **Pick a pipeline** from `C:\Users\1\github-pr\OpenMontage\pipeline_defs\` — 12 pipelines available
3. **Read the pipeline manifest** (YAML) — know the stages, tools, and quality gates
4. **Read stage director skills** before each stage: `C:\Users\1\github-pr\OpenMontage\skills\pipelines\<pipeline>\<stage>-director.md`
5. **Read Layer 3 skills** before calling tools: `C:\Users\1\github-pr\OpenMontage\.agents\skills\`

## Available Pipelines

| Pipeline | Description | Best for |
|----------|-------------|----------|
| animated-explainer | Animated explainer videos | Education, marketing |
| animation | Character/puppet animation | Entertainment |
| avatar-spokesperson | Talking-head avatar | Business, corporate |
| character-animation | Character-driven animation | Storytelling |
| cinematic | Cinematic short videos | Film-style content |
| clip-factory | Multi-clip video production | Social media |
| documentary-montage | Documentary from real footage | Non-fiction |
| hybrid | Mixed pipeline (combines others) | Complex projects |
| localization-dub | Video localization/dubbing | Multi-language |
| podcast-repurpose | Podcast → video clips | Podcast marketing |
| screen-demo | Screen recording demos | Tutorials, demos |
| talking-head | Talking head videos | Vlogging, education |

## How to Use Tools

Tools are Python `BaseTool` subclasses in `C:\Users\1\github-pr\OpenMontage\tools\`. Call them via subprocess:

```python
import subprocess, json
result = subprocess.run(
    ["python", "-m", "tools.<category>.<tool_name>"],
    input=json.dumps({"arg": "value"}),
    capture_output=True,
    text=True,
    cwd="C:\\Users\\1\\github-pr\\OpenMontage"
)
```

## Key Tools

- **video_analyzer**: Analyze reference videos (scene detection, pacing, style)
- **transcript_extractor**: Extract transcripts from audio/video
- **script_writer**: Generate scripts from topics
- **image_generator**: Generate images (via fal.ai/ComfyUI)
- **voice_generator**: Generate TTS (via Edge-TTS, Index-TTS)
- **video_composer**: Compose final video (via Remotion/FFmpeg)
- **quality_checker**: Check output quality (ffprobe, frame sampling)

## Example: Explainer Video

```yaml
# 1. Read pipeline manifest
pipeline: animated-explainer
stages: [script, storyboard, asset_generation, voiceover, composition, review]

# 2. Generate script
script: "A 60-second explainer about quantum computing"

# 3. Generate storyboard (AI)
storyboard: [scene1, scene2, scene3, scene4]

# 4. Generate assets (AI images)
assets: [scene1_img.png, scene2_img.png, ...]

# 5. Generate voiceover (TTS)
voiceover: "Quantum computing uses quantum bits..."

# 6. Compose video
output: quantum-explainer.mp4

# 7. Self-review
quality: check pacing, audio sync, visual coherence
```

## Reference Video Workflow

When the user provides a video URL as inspiration:

1. Read `skills/meta/video-reference-analyst.md`
2. Run `video_analyzer` on the reference
3. Produce grounded summary (content, pacing, structure, style)
4. Pick a pipeline based on the analysis
5. Present 2-3 differentiated concepts (not a copy)

## Provider Selection

OpenMontage auto-selects the best provider per stage (scored on 7 dimensions: quality, speed, cost, reliability, availability, language support, style match). You don't need to pick manually — the tool registry handles it.

## Budget Caps

OpenMontage tracks costs per pipeline. Set `budget_cap` in the pipeline manifest to prevent runaway spending.

## Quality Gates

Every stage has quality gates (ffprobe validation, frame sampling, audio review). The agent self-reviews before presenting to the human.

## Reference Files

- **AGENT_GUIDE.md**: `C:\Users\1\github-pr\OpenMontage\AGENT_GUIDE.md` (full operating guide)
- **PROJECT_CONTEXT.md**: `C:\Users\1\github-pr\OpenMontage\PROJECT_CONTEXT.md` (architecture)
- **Pipeline defs**: `C:\Users\1\github-pr\OpenMontage\pipeline_defs\*.yaml`
- **Stage skills**: `C:\Users\1\github-pr\OpenMontage\skills\pipelines\*\*-director.md`
- **Layer 3 skills**: `C:\Users\1\github-pr\OpenMontage\.agents\skills\`
