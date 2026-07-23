// Counts hardcoded English strings in React components
const fs = require("node:fs");
const path = require("node:path");

const files = [];
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === "dist" || ent.name === ".git") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(ent.name)) files.push(p);
  }
}
walk("web/src");

const reJsx = />[^<{]*[A-Z][a-zA-Z]{4,}[^<{]*</g;
const reAttr = /\b(title|placeholder|aria-label|alt)=["']([A-Z][^"']{3,})["']/g;

let jsxHits = 0;
let attrHits = 0;
const samples = [];
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  // Only flag files that DON'T use t()/i18n
  const hasI18n = /\b(useTranslation|t\(|i18n\.t)\b/.test(src);
  if (hasI18n) continue;
  for (const m of src.matchAll(reJsx)) {
    const s = m[0];
    // Skip if it looks like a tag name only
    if (/^<[a-z]/.test(s.trim()) || /^<\/[a-z]/.test(s.trim())) continue;
    jsxHits++;
    if (samples.length < 30) samples.push(`${f}: ${s.slice(0, 80)}`);
  }
  for (const m of src.matchAll(reAttr)) {
    attrHits++;
    if (samples.length < 60) samples.push(`${f}: attr ${m[1]}=${m[2].slice(0, 40)}`);
  }
}
console.log(`Files without i18n: ${files.filter((f) => !/\b(useTranslation|t\(|i18n\.t)\b/.test(fs.readFileSync(f, "utf8"))).length} / ${files.length}`);
console.log(`JSX-text candidates: ${jsxHits}`);
console.log(`attr candidates: ${attrHits}`);
console.log("\n--- samples ---");
console.log(samples.join("\n"));
