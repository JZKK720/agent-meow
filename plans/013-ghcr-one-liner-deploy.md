# Plan 013: GHCR one-liner deploy for the full voice stack

**Written against:** `git rev-parse --short HEAD` = (record before execution)
**Author:** improve skill (read-only advisor)
**Scope:** `deploy/docker/`, `.github/workflows/`, `README.md` quickstart section

## Why this matters

The stack is 90% packaged — GHCR images exist, an all-in-one compose file exists,
defaults are wired. The remaining 10% is: (a) qwen3-tts has no published GHCR image
so the compose forces a local build, which forces a repo clone; (b) there is no
"curl this one command" quickstart that a brand-new user can run without cloning;
(c) the Hermes image must be confirmed as published at `ghcr.io/jzkk720/hermes-agent`.

The goal: a user runs **one PowerShell or curl command** and the entire voice-capable
agent-meow stack is up on `http://localhost:6767` — no git clone, no repo checkout,
no manual `docker pull`. Docker Compose pulls all images from GHCR automatically.

## Architecture (as-is)

```
docker-compose.all-in-one.yaml (6 services):

  postgres:16-alpine          ← Docker Hub pull
  ollama/ollama:latest        ← Docker Hub pull
  ghcr.io/jzkk720/hermes-agent:latest   ← GHCR pull (SEPARATE repo/image)
  qwen3-tts                   ← LOCAL BUILD (deploy/docker/Dockerfile.qwen3-tts) ← THE GAP
  ghcr.io/jzkk720/agent-meow-server:latest  ← GHCR pull (this repo's CI)
  ghcr.io/jzkk720/agent-meow-server:latest (target=host) ← GHCR pull
```

**Key fact:** Hermes is a **separate image from a separate repo**. It is NOT built
from the agent-meow repo. Compose pulls it automatically — the user does NOT run a
separate `docker pull` for it. But the image must exist at that GHCR URL.

## Pre-flight checks (do these BEFORE executing any step)

1. **Verify the agent-meow server image is pullable:**
   ```powershell
   docker pull ghcr.io/jzkk720/agent-meow-server:latest
   ```
   If this fails with 401/403, the GHCR package is still private. Fix: go to
   `github.com/users/JZKK720/packages/container/agent-meow-server/settings`
   and set visibility to Public.

2. **Verify the Hermes image is published:**
   ```powershell
   docker pull ghcr.io/jzkk720/hermes-agent:latest
   ```
   If this fails with `not found`, the Hermes image does not exist at this URL yet.
   You must publish it from the Hermes repo's own CI to `ghcr.io/jzkk720/hermes-agent`.
   This is a **separate repo** — agent-meow's CI cannot build it. Options:
   - (a) If you own the Hermes repo: add a GHCR publish workflow there, tagging to
     `ghcr.io/jZKK720/hermes-agent:latest`.
   - (b) If Hermes publishes to a different namespace: update the `image:` line in
     `deploy/docker/docker-compose.all-in-one.yaml:68` to point at the real URL.

3. **Record the commit hash for drift detection:**
   ```powershell
   git rev-parse --short HEAD
   ```
   Write it into the plan's "execution against" line at the top.

---

## Step 1 — Publish qwen3-tts to GHCR (closes the "no clone needed" gap)

**Why:** `docker-compose.all-in-one.yaml` has `build:` on the qwen3-tts service.
Until the image is on GHCR, compose forces a local build, which forces a repo
checkout. Publishing the image lets us strip the `build:` block and go pure-pull.

### 1a. Add qwen3-tts to the publish workflow

**File:** `.github/workflows/oss-publish-images.yml`
**What to add:** A third image build+push job (or a third matrix leg) that builds
`deploy/docker/Dockerfile.qwen3-tts` and pushes to
`ghcr.io/jzkk720/agent-meow-qwen3-tts` with the same tag scheme (`:latest`,
`:sha-<short>`, `:vX.Y.Z`).

Follow the exact pattern of the existing `build-and-push` job:
- Same `permissions: packages: write`
- Same GHCR login step
- Build context: `.` (repo root), dockerfile: `deploy/docker/Dockerfile.qwen3-tts`
- Push to `ghcr.io/jzkk720/agent-meow-qwen3-tts` with the tag set

**Image size note:** The qwen3-tts image is ~6GB (bakes the 0.6B model). The
`timeout-minutes: 60` in the existing job is sufficient. Multi-arch is optional
here — the image is CPU-only and arch-portable, but `linux/amd64` alone is fine
for a first pass. Add `linux/arm64` only if you need Apple Silicon support.

### 1b. Update compose to use the published image

**File:** `deploy/docker/docker-compose.all-in-one.yaml`
**Lines:** The `qwen3-tts:` service block (around line 92-110)

Change:
```yaml
  qwen3-tts:
    build:
      context: ../..
      dockerfile: deploy/docker/Dockerfile.qwen3-tts
    image: ${QWEN3_TTS_IMAGE:-qwen3-tts}:${QWEN3_TTS_TAG:-latest}
```

To:
```yaml
  qwen3-tts:
    image: ${QWEN3_TTS_IMAGE:-ghcr.io/jzkk720/agent-meow-qwen3-tts}:${QWEN3_TTS_TAG:-latest}
```

Strip the `build:` block entirely. This makes the service pure-pull.

### 1c. Update .env.all-in-one

**File:** `deploy/docker/.env.all-in-one`

Add after the agent-meow image section:
```env
# ── Qwen3-TTS image ───────────────────────────────────────────────
QWEN3_TTS_IMAGE=ghcr.io/jzkk720/agent-meow-qwen3-tts
QWEN3_TTS_TAG=latest
```

### Verification
```powershell
docker pull ghcr.io/jzkk720/agent-meow-qwen3-tts:latest
# Expected: succeeds, ~6GB download
```

---

## Step 2 — Create a "no-clone" compose file variant

**Why:** Even with all images on GHCR, `docker-compose.all-in-one.yaml` still has
`build:` fallback blocks on the agent-meow-server and agent-meow-host services
(for forks/offline dev). These `build:` blocks reference `context: ../..` which
requires a repo checkout. For the one-liner, we need a compose file with zero
`build:` blocks — pure image pull.

### 2a. Create `deploy/docker/docker-compose.quickstart.yaml`

This is a **copy** of `docker-compose.all-in-one.yaml` with every `build:` block
removed. It is the file the one-liner fetches and runs.

**How to generate it (do not hand-write — copy and strip):**
1. Copy `docker-compose.all-in-one.yaml` → `docker-compose.quickstart.yaml`
2. Remove all `build:` keys and their children from every service
3. Keep all `image:`, `environment:`, `volumes:`, `ports:`, `depends_on:`,
   `healthcheck:`, `restart:`, `command:` blocks unchanged
4. Add a header comment:

```yaml
# agent-meow quickstart — pure image-pull, no repo clone needed.
#
# This file is generated from docker-compose.all-in-one.yaml with all
# build: blocks stripped. Every image is pulled from GHCR.
#
# One-liner (PowerShell):
#   curl -sL https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker/docker-compose.quickstart.yaml -o docker-compose.yml; `
#   curl -sL https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker/.env.all-in-one -o .env; `
#   docker compose up -d
#
# One-liner (bash):
#   curl -sL https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker/docker-compose.quickstart.yaml -o docker-compose.yml && \
#   curl -sL https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker/.env.all-in-one -o .env && \
#   docker compose up -d
#
# Then open http://localhost:6767
```

### Verification
```powershell
# In a temp dir, simulate the one-liner:
mkdir test-deploy; cd test-deploy
curl -sL https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker/docker-compose.quickstart.yaml -o docker-compose.yml
curl -sL https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker/.env.all-in-one -o .env
docker compose up -d
# Expected: all 6 services start, no "context not found" errors
docker compose ps
# Expected: 6 services, all Up or starting
curl http://localhost:6767
# Expected: HTML response (the web UI)
docker compose down -v  # cleanup
```

---

## Step 3 — Create a PowerShell one-liner script (optional, nicer UX)

**Why:** The raw curl one-liner is long and easy to typo. A hosted `.ps1` script
is cleaner for Windows users (your target audience).

### 3a. Create `deploy/docker/quickstart.ps1`

```powershell
# agent-meow quickstart — one command, full voice stack on localhost:6767
# Requires: Docker Desktop running, PowerShell 5.1+
#
# Usage:
#   irm https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker/quickstart.ps1 | iex
#
# Or save and run:
#   curl -sL https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker/quickstart.ps1 -o quickstart.ps1; .\quickstart.ps1

$ErrorActionPreference = "Stop"
$base = "https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker"

Write-Host "==> Fetching docker-compose.quickstart.yaml..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "$base/docker-compose.quickstart.yaml" -OutFile "docker-compose.yml"

Write-Host "==> Fetching .env.all-in-one..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "$base/.env.all-in-one" -OutFile ".env"

Write-Host "==> Pulling images and starting the stack..." -ForegroundColor Cyan
docker compose up -d

Write-Host ""
Write-Host "==> Stack is up! Open http://localhost:6767" -ForegroundColor Green
Write-Host "==> First boot takes ~60s (model loading). Check status with:"
Write-Host "    docker compose ps"
Write-Host "    docker compose logs -f agent-meow-server"
Write-Host ""
Write-Host "==> To stop: docker compose down -v"
```

### Verification
```powershell
# In a clean temp dir:
irm https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker/quickstart.ps1 | iex
# Expected: files downloaded, stack starts, URL printed
```

---

## Step 4 — Document the one-liner in the README

**File:** `deploy/docker/README.md` (and optionally `README.md` root quickstart)

Add a new top-level section after the existing quickstart:

```markdown
## Quickstart (no clone — one command)

The full voice stack (agent-meow + Hermes gateway + Ollama + Qwen3-TTS + Postgres)
runs from GHCR images with no repo checkout needed.

**PowerShell (Windows):**
```powershell
irm https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker/quickstart.ps1 | iex
```

**Bash (Linux/macOS):**
```bash
curl -sL https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker/docker-compose.quickstart.yaml -o docker-compose.yml && \
curl -sL https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker/.env.all-in-one -o .env && \
docker compose up -d
```

Then open http://localhost:6767. First boot takes ~60s for model loading.

**What you get:**
- `:6767` — agent-meow web UI + API
- `:8642` — Hermes voice gateway (STT → LLM → TTS)
- `:8889` — Qwen3-TTS (offline TTS fallback)
- `:11434` — Ollama (local LLM)

**To stop:** `docker compose down -v`
```

### Verification
Read the rendered README on GitHub after push — confirm the one-liner is visible
and the raw URLs resolve (click them).

---

## Dependency ordering

```
Pre-flight (verify images exist) → Step 1 (publish qwen3-tts)
                                  → Step 2 (create quickstart compose)
                                  → Step 3 (create quickstart.ps1)  [optional, can run parallel with 2]
                                  → Step 4 (update README)          [after 2+3]
```

Step 1 must land first — without the qwen3-tts image on GHCR, the quickstart
compose file will fail on that service. Steps 2 and 3 can be done in parallel.
Step 4 (docs) comes last, after the URLs are confirmed live.

## Ollama decision: keep container in quickstart, document host override

Ollama is a **stock Docker Hub image** (`ollama/ollama:latest`) — no packaging
work needed. The quickstart compose keeps the Ollama container so the one-liner
is truly self-contained (a fresh machine with only Docker gets the full stack).

For users who **already have Ollama installed on the host** with models pulled,
the `.env.all-in-one` documents a simple override: set `OLLAMA_BASE_URL` to
`http://host.docker.internal:11434` and optionally remove the `ollama:` service
via a compose override file. This avoids running a second Ollama instance and
re-pulling models. The quickstart compose uses an env var for the URL so the
override requires zero edits to the compose file itself.

### Implementation: env-var the Ollama URL in compose

The current `docker-compose.all-in-one.yaml` hardcodes
`OLLAMA_BASE_URL: "http://ollama:11434"` in the hermes-gateway environment.
Change it to use an env var with the container-internal default:

```yaml
# Before:
OLLAMA_BASE_URL: "http://ollama:11434"

# After:
OLLAMA_BASE_URL: "${OLLAMA_BASE_URL:-http://ollama:11434}"
```

This way:
- **Default (quickstart):** Hermes talks to the compose's Ollama container.
- **Host-Ollama override:** User sets `OLLAMA_BASE_URL=http://host.docker.internal:11434`
  in `.env` — Hermes talks to the host's Ollama, no container needed.

The `ollama:` service stays in the compose (self-contained default), but a user
who overrides the URL can also add a compose override file to drop the service
and save ~500MB. Document this in `.env.all-in-one` and the README.

### Files to change for this step

1. `deploy/docker/docker-compose.all-in-one.yaml` — env-var the
   `OLLAMA_BASE_URL` line in the hermes-gateway service
2. `deploy/docker/.env.all-in-one` — add commented override section
3. `deploy/docker/docker-compose.quickstart.yaml` (Step 2) — inherits the
   env-var pattern automatically since it's copied from all-in-one
4. `deploy/docker/README.md` — add a "Using your host Ollama" subsection

### Verification
```powershell
# Default (container Ollama):
docker compose up -d
docker exec agent-meow-full-hermes-gateway-1 printenv OLLAMA_BASE_URL
# Expected: http://ollama:11434

# Host-Ollama override:
echo "OLLAMA_BASE_URL=http://host.docker.internal:11434" >> .env
docker compose up -d
docker exec agent-meow-full-hermes-gateway-1 printenv OLLAMA_BASE_URL
# Expected: http://host.docker.internal:11434
```

## Things explicitly OUT of scope

- **Building/publishing the Hermes image** — that's the Hermes repo's job, a
  separate project. This plan assumes `ghcr.io/jzkk720/hermes-agent:latest`
  already exists (verify in pre-flight). If it doesn't, that's a separate task
  in the Hermes repo, not here.
- **Changing the Hermes config** — the default config in the image is used as-is.
  Users who want custom models edit the mounted `hermes-data` volume after first
  boot (same workflow as today).
- **Adding GPU support** — the compose file already has commented-out GPU blocks.
  Uncommenting them is a user choice at deploy time, not a packaging change.
- **Electron installer** — tracked separately in `packaging-options-2026-08-18.md`.
- **Multi-arch for qwen3-tts** — amd64 first. Arm64 can follow if needed.
- **Packaging Ollama** — it's a stock public Docker Hub image (`ollama/ollama:latest`).
  No build, no publish, no GHCR needed. The quickstart keeps the container for
  self-containment; host-Ollama users override via `.env`.

## Risk assessment

| Step | Risk | Mitigation |
|------|------|------------|
| 1 | qwen3-tts image is 6GB — slow push, GHCR storage cost | One-time cost; acceptable for a demo image |
| 2 | quickstart compose drifts from all-in-one over time | Add a CI check: `diff` the two files ignoring `build:` blocks |
| 3 | PowerShell execution policy blocks `irm \| iex` | Document `Set-ExecutionPolicy -Scope Process Bypass` fallback |
| 4 | Raw GitHub URLs change if repo renamed | Use the `JZKK720/agent-meow` path — stable as long as the fork exists |

## Success criteria (machine-checkable)

1. `docker pull ghcr.io/jzkk720/agent-meow-qwen3-tts:latest` succeeds
2. `docker pull ghcr.io/jzkk720/hermes-agent:latest` succeeds
3. `docker pull ghcr.io/jzkk720/agent-meow-server:latest` succeeds
4. In a clean empty dir with no repo clone:
   ```powershell
   irm https://raw.githubusercontent.com/JZKK720/agent-meow/main/deploy/docker/quickstart.ps1 | iex
   ```
   → `docker compose ps` shows 6 services Up, `curl http://localhost:6767` returns HTML
5. `grep -c "build:" deploy/docker/docker-compose.quickstart.yaml` returns 0