/**
 * DEMO content seeder — throwaway sample data for AFCAT so the authed pages can
 * be seen with real rows (populated states, video player, gallery, etc.).
 *
 * NOT for production. Everything it inserts is prefixed "DEMO" so it's easy to
 * spot and delete before real content is loaded. Run: `npm run db:seed:demo`
 * (requires DATABASE_URL and `npm run db:seed` already run for the exams row).
 */
import { eq } from "drizzle-orm"
import { db } from "./index"
import {
  exams,
  batches,
  subjects,
  lessons,
  pdfs,
  galleryImages,
  testForms,
} from "./schema"

const VIDEO = "https://player.vimeo.com/video/76979871" // public sample clip

async function demo() {
  const exam = await db.query.exams.findFirst({ where: eq(exams.slug, "afcat") })
  if (!exam) throw new Error("Exams missing — run `npm run db:seed` first.")

  const [batch] = await db
    .insert(batches)
    .values({ examId: exam.id, name: "DEMO Batch — 2026 Cycle", cycle: "Jan 2026", sort: 0 })
    .returning()

  const subs = await db
    .insert(subjects)
    .values([
      { batchId: batch.id, name: "Physics", teacher: "Sqn Ldr A. Rao", sort: 0 },
      { batchId: batch.id, name: "Reasoning", teacher: "Wg Cdr S. Nair", sort: 1 },
    ])
    .returning()

  await db.insert(lessons).values([
    { subjectId: subs[0].id, idx: 1, title: "Kinematics — the basics", source: "vimeo", playUrl: VIDEO, durationSec: 1830 },
    { subjectId: subs[0].id, idx: 2, title: "Newton's laws of motion", source: "vimeo", playUrl: VIDEO, durationSec: 2400 },
    { subjectId: subs[1].id, idx: 1, title: "Series & sequences", source: "vimeo", playUrl: VIDEO, durationSec: 1500 },
  ])

  await db
    .insert(pdfs)
    .values([
      { examId: exam.id, filename: "DEMO — Physics formula sheet.pdf", url: "https://example.com/demo-1.pdf", fileHash: "demo-hash-1" },
      { examId: exam.id, filename: "DEMO — Reasoning practice set.pdf", url: "https://example.com/demo-2.pdf", fileHash: "demo-hash-2" },
    ])
    .onConflictDoNothing()

  await db.insert(galleryImages).values([
    { examId: exam.id, url: "https://picsum.photos/seed/gf1/600" },
    { examId: exam.id, url: "https://picsum.photos/seed/gf2/600" },
    { examId: exam.id, url: "https://picsum.photos/seed/gf3/600" },
  ])

  await db.insert(testForms).values([
    { examId: exam.id, setName: "DEMO Mock Test 1", timeLimitMin: 120, formUrl: "https://docs.google.com/forms/d/e/EXAMPLE/viewform", formDate: "2026-01-15" },
  ])

  console.log("DEMO content seeded for AFCAT. Delete the DEMO rows before real content.")
}

demo()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
