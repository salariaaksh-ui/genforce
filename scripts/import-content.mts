/**
 * Content importer CLI. Loads one JSON-per-exam file into the DB (see
 * docs/superpowers/specs/2026-08-13-content-importer-design.md).
 *
 *   npm run db:import path/to/afcat.json            # load (uses .env DATABASE_URL)
 *   npm run db:import path/to/afcat.json -- --dry   # validate + report only
 *
 * Offline test against the PGlite dev DB:
 *   DATABASE_URL=pglite://.pglite node --import tsx scripts/import-content.mts sample.json
 */
import { readFileSync } from "node:fs"
import { parseContent, ContentError } from "../lib/content/schema"
import { importContent } from "../lib/content/import"

const file = process.argv[2]
const dry = process.argv.includes("--dry")
if (!file) {
  console.error("usage: db:import <file.json> [-- --dry]")
  process.exit(1)
}

let parsed
try {
  const raw = JSON.parse(readFileSync(file, "utf8"))
  parsed = parseContent(raw)
} catch (e) {
  console.error(
    e instanceof ContentError ? e.message : `Cannot read/parse ${file}: ${(e as Error).message}`
  )
  process.exit(1)
}

for (const w of parsed.warnings) console.warn("warn:", w)

const counts = {
  batches: parsed.data.batches.length,
  subjects: parsed.data.batches.reduce((n, b) => n + b.subjects.length, 0),
  lessons: parsed.data.batches.reduce(
    (n, b) => n + b.subjects.reduce((m, s) => m + s.lessons.length, 0),
    0
  ),
  pdfs: parsed.data.pdfs.length,
  gallery: parsed.data.gallery.length,
  tests: parsed.data.tests.length,
}

if (dry) {
  console.log(`dry run for exam "${parsed.data.exam}" — would load:`, counts)
  process.exit(0)
}

// Build the db lazily so --dry never opens a DB connection. Import buildDb (not
// ../lib/db) so tsx never transforms the top-level-await index module.
const { buildDb } = await import("../lib/db/build")
const db = await buildDb()
const result = await importContent(db, parsed.data)
console.log(`imported into exam "${parsed.data.exam}":`, result)
process.exit(0)
