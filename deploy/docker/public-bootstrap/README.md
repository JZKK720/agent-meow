# agent-meow public bootstrap bundle

Upload the contents of this folder to any public static host (GitHub Pages,
Cloudflare R2 static site, S3 website hosting, a plain web server, etc.).
Clients do not need repo access; they only need Docker Desktop and this URL.

## Files in this bundle

- `docker-compose.yml` — quickstart image-pull stack
- `.env` — starter env values
- `hermes-config.yaml` — Hermes default model/TTS config
- `hermes-edge-zh-hotfix.ps1` — optional post-start Chinese Edge TTS fix
- `start-stack.ps1` — local pull/up launcher that also runs the hotfix
- `one-liner.txt` — copy/paste PowerShell bootstrap line

## Client one-liner

Edit `one-liner.txt` and replace `https://YOUR-PUBLIC-HOST/agent-meow-bootstrap`
with the URL where you uploaded these files. Then the client runs:

```powershell
$env:GHCR_USERNAME='YOUR_GITHUB_USERNAME'; $env:GHCR_TOKEN='YOUR_GHCR_TOKEN'; $Base='https://YOUR-PUBLIC-HOST/agent-meow-bootstrap'; $ErrorActionPreference='Stop'; $Dir='agent-meow-stack'; if(!(Test-Path $Dir)){New-Item -ItemType Directory -Path $Dir | Out-Null}; Set-Location $Dir; foreach($f in 'docker-compose.yml','.env','hermes-config.yaml','hermes-edge-zh-hotfix.ps1','start-stack.ps1'){Invoke-WebRequest -Uri "$Base/$f" -OutFile $f}; powershell -NoProfile -ExecutionPolicy Bypass -File .\start-stack.ps1
```

If the GHCR packages are public, omit the first two assignments.

## If GHCR packages are still private

`start-stack.ps1` logs in automatically when both `GHCR_USERNAME` and
`GHCR_TOKEN` are set in the shell. If you prefer to log in manually first:

```powershell
echo YOUR_GHCR_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

The token needs `read:packages`.

## Notes

- `start-stack.ps1` automatically runs the Hermes Chinese Edge TTS hotfix.
- If you later publish a fixed `ghcr.io/jzkk720/hermes-agent:latest`, clients can run:
  `powershell -NoProfile -ExecutionPolicy Bypass -File .\start-stack.ps1 -SkipHermesHotfix`
- To stop the stack: `docker compose down -v`
