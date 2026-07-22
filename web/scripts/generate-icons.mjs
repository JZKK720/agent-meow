#!/usr/bin/env node
// Generate favicon + PWA icons from the 橘宝疾风 (Orange Treasure Storm) cat.
//
// Single source: public/favicon.svg — the geometric cat silhouette (ember
// #E8651A + amber #FFB347). It is the ONLY correct icon source. mascot-hero.png
// is a cropped fragment of the larger illustration, NOT a complete icon, so it
// is not used here. Every raster icon (favicon PNG fallback, apple-touch, PWA
// square + maskable) is rasterised from the same SVG so PNG and SVG render the
// identical cat mark.
//
// ColorFire (ember) is the default brand. The cat is shared across both OEMs
// (ColorFire + Meow): the silhouette is brand-neutral, and SVG favicons can't
// resolve CSS custom properties, so a single mark serves both skins.
//
// Run:  node scripts/generate-icons.mjs
// Verify: every icon file references the cat; PNG + SVG render the same mark.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = join(__dirname, "..", "public");

const svgPath = join(pub, "favicon.svg");

// Render the SVG cat to a PNG buffer at a given edge size. fit: "contain" keeps
// the full silhouette centred on a transparent canvas so the mark never clips.
async function catPng(size) {
  const svg = await readFile(svgPath);
  return sharp(svg, { density: 384 })
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

// Maskable icon: the platform clips a circle/squircle, so the mark needs a
// ~10% safe-zone margin. Same cat silhouette, scaled down inside the safe zone,
// composited onto the ColorFire warm-dark canvas (#1A1410) so the clipped edge
// stays branded rather than transparent.
async function maskablePng(size) {
  const pad = Math.round(size * 0.10); // 10% safe zone per PWA spec
  const inner = await catPng(size - pad * 2);
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: "#1A1410",
    },
  })
    .composite([
      {
        input: inner,
        gravity: "center",
      },
    ])
    .png()
    .toBuffer();
}

const jobs = [
  // PNG fallback that matches the vector cat — primary rel="icon" in index.html.
  { name: "favicon-brand.png", run: () => catPng(32) },
  // Apple touch icon: the cat silhouette, iOS rounds the square corners.
  { name: "apple-touch-icon.png", run: () => catPng(180) },
  // Square PWA icons: the cat silhouette.
  { name: "pwa-192.png", run: () => catPng(192) },
  { name: "pwa-512.png", run: () => catPng(512) },
  // Maskable PWA icon: same cat with 10% safe-zone on the warm-dark canvas.
  { name: "pwa-maskable-512.png", run: () => maskablePng(512) },
];

let ok = 0;
for (const job of jobs) {
  const buf = await job.run();
  const out = join(pub, job.name);
  await sharp(buf).toFile(out);
  console.log(`  wrote ${job.name} (${buf.length} bytes)`);
  ok++;
}
console.log(
  `\nGenerated ${ok}/${jobs.length} cat icons from favicon.svg (single source).`,
);
console.log("All icons now use the 橘宝疾风 cat. PNG + SVG render the same mark.");