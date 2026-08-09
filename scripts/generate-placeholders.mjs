/**
 * Generates local placeholder images into /public/sample so the template
 * renders with sample data offline. NOT for production — clients replace
 * these with real, licensed photography. Re-run: `node scripts/generate-placeholders.mjs`
 */
import sharp from "sharp"
import { mkdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const outDir = join(root, "public", "sample")
mkdirSync(outDir, { recursive: true })

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;")

function tile({ w, h, bg, label, sub }) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.10"/>
    <stop offset="1" stop-color="#000000" stop-opacity="0.18"/>
  </linearGradient></defs>
  <text x="50%" y="47%" font-family="Arial, sans-serif" font-size="${Math.round(h * 0.11)}" font-weight="700" fill="#ffffff" text-anchor="middle">${esc(label)}</text>
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="${Math.round(h * 0.045)}" fill="#ffffff" fill-opacity="0.85" text-anchor="middle">${esc(sub)}</text>
</svg>`)
}

const colors = [
  "#3f5b63", "#6b5b52", "#4a5a72", "#5a6b52",
  "#72565a", "#4c4f5a", "#63563f", "#556b6b",
]

async function make(name, w, h, bg, label, sub) {
  await sharp(tile({ w, h, bg, label, sub }))
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(join(outDir, name))
  console.log("wrote", name)
}

// Home hero (16:9)
await make("hero.jpg", 2400, 1350, "#3a4a52", "SAMPLE HERO", "Replace with client hero image")

// Property photos (3:2) — 8 tiles, assigned across the 4 sample listings
for (let i = 1; i <= 8; i++) {
  const bg = colors[(i - 1) % colors.length]
  await make(`property-${String(i).padStart(2, "0")}.jpg`, 1600, 1067, bg, `SAMPLE PHOTO ${i}`, "Replace per client")
}

// Agent avatars (square)
for (let i = 1; i <= 3; i++) {
  await make(`agent-${String(i).padStart(2, "0")}.jpg`, 600, 600, colors[i], `A${i}`, "Sample")
}

console.log("done ->", outDir)
