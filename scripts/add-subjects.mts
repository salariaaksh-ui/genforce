// One-off, add-only: create missing subjects (never touches existing rows).
// Exam with no batch gets a placeholder free batch (rename/price later in /admin).
//   DATABASE_URL=... [BATCH_AFCAT="name"] node --import tsx scripts/add-subjects.mts
import { and, asc, eq } from "drizzle-orm"
import { buildDb } from "../lib/db/build"
import * as s from "../lib/db/schema"

const WANT: Record<string, string[]> = {
  afcat: ["Reasoning", "Maths", "English", "General Science"],
  cds: ["Maths", "General Science"],
}

const db = await buildDb()
for (const [slug, names] of Object.entries(WANT)) {
  const exam = await db.query.exams.findFirst({ where: eq(s.exams.slug, slug) })
  if (!exam) throw new Error(`exam ${slug} not seeded`)
  const batches = await db.select().from(s.batches).where(eq(s.batches.examId, exam.id)).orderBy(asc(s.batches.sort))
  // Several batches: pick by name via BATCH_<SLUG>="exact name", else refuse to guess.
  const pick = process.env[`BATCH_${slug.toUpperCase()}`]
  let batch = pick ? batches.find((b) => b.name === pick) : batches[0]
  if (batches.length > 1 && !pick)
    throw new Error(`${slug}: ${batches.length} batches — set BATCH_${slug.toUpperCase()} to one of: ${batches.map((b) => JSON.stringify(b.name)).join(", ")}`)
  if (pick && !batch) throw new Error(`${slug}: no batch named ${JSON.stringify(pick)}`)
  if (!batch) {
    ;[batch] = await db.insert(s.batches).values({ examId: exam.id, name: `${exam.name} 2027 Batch` }).returning()
    console.log(`${slug}: created batch "${batch.name}" (free, no price)`)
  }
  for (const [i, name] of names.entries()) {
    const hit = await db.query.subjects.findFirst({ where: and(eq(s.subjects.batchId, batch.id), eq(s.subjects.name, name)) })
    if (hit) { console.log(`${slug}/${batch.name}: "${name}" exists, skipped`); continue }
    await db.insert(s.subjects).values({ batchId: batch.id, name, sort: i })
    console.log(`${slug}/${batch.name}: added "${name}"`)
  }
}
process.exit(0)
