# Report Diagrams

Mermaid source files for the 395 (Strix Halo) and HX470 full-scope reports.

## Files

- `395-*.mmd` — diagrams for the 灵创K16 (AI MAX+ 395) report
- `hx470-*.mmd` — diagrams for the 橘宝R16 (HX 470 + RTX 5060) report
- `dual-*.mmd` — diagrams shared by both reports (dual-platform comparison)
- `*.svg` — rendered SVG outputs (embedded in the Marp slides)

## Render

```powershell
# Install mermaid CLI once:
#   npm install -g @mermaid-js/mermaid-cli
# Then:
#   mmdc -i diagrams/395-architecture.mmd -o diagrams/395-architecture.svg -b transparent
```
