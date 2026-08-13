import { createHash } from "node:crypto"
import { and, eq } from "drizzle-orm"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import * as s from "@/lib/db/schema"
import type { Content } from "./schema"

type Db = PostgresJsDatabase<typeof s>
export type UpsertCount = { inserted: number; updated: number }
export type SkipCount = { inserted: number; skipped: number }
export type ImportResult = {
  batches: UpsertCount
  subjects: UpsertCount
  lessons: UpsertCount
  pdfs: SkipCount
  gallery: SkipCount
  tests: UpsertCount
}

const sha = (v: string) => createHash("sha256").update(v).digest("hex")

/** Load validated content into the DB, idempotently, in one transaction.
 *  Hierarchical entities find-then-upsert by natural key; the append-only pools
 *  (pdfs, gallery) insert-or-skip. Nothing is deleted. */
export async function importContent(db: Db, data: Content): Promise<ImportResult> {
  const exam = await db.query.exams.findFirst({ where: eq(s.exams.slug, data.exam) })
  if (!exam) throw new Error(`Exam "${data.exam}" not seeded — run \`npm run db:seed\` first`)
  const examId = exam.id

  const r: ImportResult = {
    batches: { inserted: 0, updated: 0 },
    subjects: { inserted: 0, updated: 0 },
    lessons: { inserted: 0, updated: 0 },
    pdfs: { inserted: 0, skipped: 0 },
    gallery: { inserted: 0, skipped: 0 },
    tests: { inserted: 0, updated: 0 },
  }

  await db.transaction(async (tx) => {
    for (const b of data.batches) {
      const bvals = {
        cycle: b.cycle ?? null,
        sort: b.sort,
        thumbnail: b.thumbnail ?? null,
        priceInr: b.priceInr ?? null,
        description: b.description ?? null,
      }
      const eb = await tx.query.batches.findFirst({
        where: and(eq(s.batches.examId, examId), eq(s.batches.name, b.name)),
      })
      let batchId: string
      if (eb) {
        await tx.update(s.batches).set(bvals).where(eq(s.batches.id, eb.id))
        batchId = eb.id
        r.batches.updated++
      } else {
        const [row] = await tx
          .insert(s.batches)
          .values({ examId, name: b.name, ...bvals })
          .returning()
        batchId = row.id
        r.batches.inserted++
      }

      for (const su of b.subjects) {
        const svals = { teacher: su.teacher ?? null, coverImage: su.coverImage ?? null, sort: su.sort }
        const es = await tx.query.subjects.findFirst({
          where: and(eq(s.subjects.batchId, batchId), eq(s.subjects.name, su.name)),
        })
        let subjectId: string
        if (es) {
          await tx.update(s.subjects).set(svals).where(eq(s.subjects.id, es.id))
          subjectId = es.id
          r.subjects.updated++
        } else {
          const [row] = await tx
            .insert(s.subjects)
            .values({ batchId, name: su.name, ...svals })
            .returning()
          subjectId = row.id
          r.subjects.inserted++
        }

        for (const l of su.lessons) {
          const lvals = {
            title: l.title,
            source: l.source,
            playUrl: l.playUrl ?? null,
            playToken: l.playToken ?? null,
            durationSec: l.durationSec ?? null,
            recordedOn: l.recordedOn ?? null,
            sizeBytes: l.sizeBytes ?? null,
          }
          const el = await tx.query.lessons.findFirst({
            where: and(eq(s.lessons.subjectId, subjectId), eq(s.lessons.idx, l.idx)),
          })
          if (el) {
            await tx.update(s.lessons).set(lvals).where(eq(s.lessons.id, el.id))
            r.lessons.updated++
          } else {
            await tx.insert(s.lessons).values({ subjectId, idx: l.idx, ...lvals })
            r.lessons.inserted++
          }
        }
      }
    }

    for (const p of data.pdfs) {
      const fileHash = p.fileHash ?? sha(p.url)
      const res = await tx
        .insert(s.pdfs)
        .values({ examId, filename: p.filename, url: p.url, fileHash })
        .onConflictDoNothing({ target: [s.pdfs.examId, s.pdfs.fileHash] })
        .returning()
      if (res.length) r.pdfs.inserted++
      else r.pdfs.skipped++
    }

    for (const g of data.gallery) {
      const res = await tx
        .insert(s.galleryImages)
        .values({ examId, url: g.url })
        .onConflictDoNothing({ target: [s.galleryImages.examId, s.galleryImages.url] })
        .returning()
      if (res.length) r.gallery.inserted++
      else r.gallery.skipped++
    }

    for (const t of data.tests) {
      const tvals = {
        timeLimitMin: t.timeLimitMin ?? null,
        formUrl: t.formUrl,
        formDate: t.formDate ?? null,
      }
      const et = await tx.query.testForms.findFirst({
        where: and(eq(s.testForms.examId, examId), eq(s.testForms.setName, t.setName)),
      })
      if (et) {
        await tx.update(s.testForms).set(tvals).where(eq(s.testForms.id, et.id))
        r.tests.updated++
      } else {
        await tx.insert(s.testForms).values({ examId, setName: t.setName, ...tvals })
        r.tests.inserted++
      }
    }
  })

  return r
}
