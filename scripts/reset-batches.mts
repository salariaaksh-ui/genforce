// Replace ALL batches with the 4 launch batches from the poster.
//
// DESTRUCTIVE: deleting batches cascades to orders, entitlements, subjects and
// lessons (onDelete: cascade in the schema). Dry run by default — prints what it
// would delete. Pass --apply to actually delete + recreate.
//
//   npx vercel env pull .env.production.local --environment=production
//   node --env-file=.env.production.local --import tsx scripts/reset-batches.mts          # dry run
//   node --env-file=.env.production.local --import tsx scripts/reset-batches.mts --apply   # do it
import { sql, eq, inArray, type AnyColumn } from "drizzle-orm"
import { buildDb } from "../lib/db/build"
import { exams, batches, subjects, lessons, orders, entitlements } from "../lib/db/schema"

// Poster batches. accessDays null = lifetime. thumbnail null = branded fallback
// tile (add real thumbnails later in the admin panel).
const NEW_BATCHES = [
  { exam: "capf", name: "Achieve CAPF Batch (Game Changer 2027)", cycle: "Game Changer 2027", description: "Complete preparation for CAPF ACs Exam", priceInr: 700, sort: 1 },
  { exam: "capf", name: "Achieve CAPF Foundation Programme", cycle: "Foundation Programme", description: "Strong foundation for CAPF ACs Exam", priceInr: 2000, sort: 2 },
  { exam: "cds", name: "CDS Journey - Juliet Batch", cycle: "Juliet Entry", description: "Dedicated batch for CDS Exam (Juliet Entry)", priceInr: 350, sort: 3 },
  { exam: "cds", name: "CDS Journey - Indian Batch", cycle: "Indian Military Academy", description: "Dedicated batch for CDS Exam (Indian Military Academy)", priceInr: 1500, sort: 4 },
] as const

const apply = process.argv.includes("--apply")
const db = await buildDb()

// Current state + cascade impact.
const current = await db.select({ id: batches.id, name: batches.name }).from(batches)
const ids = current.map((b) => b.id)
const count = async (tbl: typeof orders | typeof entitlements | typeof subjects | typeof lessons, col: AnyColumn) =>
  ids.length === 0 ? 0 : (await db.select({ n: sql<number>`count(*)::int` }).from(tbl).where(inArray(col, ids)))[0].n

console.log(`Existing batches: ${current.length}`)
for (const b of current) console.log(`  - ${b.name}`)
console.log(`Would cascade-delete:`)
console.log(`  orders:       ${await count(orders, orders.batchId)}`)
console.log(`  entitlements: ${await count(entitlements, entitlements.batchId)}`)
console.log(`  subjects:     ${await count(subjects, subjects.batchId)}`)
// lessons hang off subjects, not batches directly — count via join.
const lessonN =
  ids.length === 0
    ? 0
    : (
        await db
          .select({ n: sql<number>`count(*)::int` })
          .from(lessons)
          .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
          .where(inArray(subjects.batchId, ids))
      )[0].n
console.log(`  lessons:      ${lessonN}`)

const examBySlug = Object.fromEntries((await db.select().from(exams)).map((e) => [e.slug, e.id]))
for (const b of NEW_BATCHES) {
  if (!examBySlug[b.exam]) throw new Error(`exam "${b.exam}" not seeded — run db:seed first`)
}

if (!apply) {
  console.log(`\nDRY RUN — nothing changed. Re-run with --apply to delete the above and create:`)
  for (const b of NEW_BATCHES) console.log(`  + [${b.exam}] ${b.name} — ₹${b.priceInr}`)
  process.exit(0)
}

await db.transaction(async (tx) => {
  await tx.delete(batches) // cascades to orders/entitlements/subjects/lessons
  for (const b of NEW_BATCHES) {
    await tx.insert(batches).values({
      examId: examBySlug[b.exam],
      name: b.name,
      cycle: b.cycle,
      description: b.description,
      priceInr: b.priceInr,
      accessDays: null,
      sort: b.sort,
    })
  }
})
console.log(`\nApplied — ${NEW_BATCHES.length} batches created.`)
process.exit(0)
