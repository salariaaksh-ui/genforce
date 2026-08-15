import { createHash } from "node:crypto"
import { asc, eq, max } from "drizzle-orm"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import * as s from "@/lib/db/schema"

/** Admin write layer. Injectable db (like the importer) so it unit-tests against
 *  pglite. Admins are trusted, so these are NOT exam-scoped like the student read
 *  layer — the caller (server actions) gates on requireAdmin() first. */
type Db = PostgresJsDatabase<typeof s>

const sha = (v: string) => createHash("sha256").update(v).digest("hex")

// ── Exams (read-only reference) ────────────────────────────────────────────
export const listExams = (db: Db) => db.select().from(s.exams).orderBy(asc(s.exams.name))

// ── Batches ────────────────────────────────────────────────────────────────
export const listBatches = (db: Db, examId: string) =>
  db.select().from(s.batches).where(eq(s.batches.examId, examId)).orderBy(asc(s.batches.sort), asc(s.batches.name))
export const getBatch = async (db: Db, id: string) =>
  (await db.select().from(s.batches).where(eq(s.batches.id, id)).limit(1))[0]
export const createBatch = (db: Db, v: typeof s.batches.$inferInsert) => db.insert(s.batches).values(v)
export const updateBatch = (db: Db, id: string, v: Partial<typeof s.batches.$inferInsert>) =>
  db.update(s.batches).set(v).where(eq(s.batches.id, id))
export const deleteBatch = (db: Db, id: string) => db.delete(s.batches).where(eq(s.batches.id, id))

// ── Subjects ─────────────────────────────────────────────────────────────────
export const listSubjects = (db: Db, batchId: string) =>
  db.select().from(s.subjects).where(eq(s.subjects.batchId, batchId)).orderBy(asc(s.subjects.sort), asc(s.subjects.name))
export const getSubject = async (db: Db, id: string) =>
  (await db.select().from(s.subjects).where(eq(s.subjects.id, id)).limit(1))[0]
export const createSubject = (db: Db, v: typeof s.subjects.$inferInsert) => db.insert(s.subjects).values(v)
export const updateSubject = (db: Db, id: string, v: Partial<typeof s.subjects.$inferInsert>) =>
  db.update(s.subjects).set(v).where(eq(s.subjects.id, id))
export const deleteSubject = (db: Db, id: string) => db.delete(s.subjects).where(eq(s.subjects.id, id))

// ── Lessons (idx auto-assigned = max in subject + 1) ─────────────────────────
export const listLessons = (db: Db, subjectId: string) =>
  db.select().from(s.lessons).where(eq(s.lessons.subjectId, subjectId)).orderBy(asc(s.lessons.idx))
export const getLesson = async (db: Db, id: string) =>
  (await db.select().from(s.lessons).where(eq(s.lessons.id, id)).limit(1))[0]
export async function createLesson(db: Db, v: Omit<typeof s.lessons.$inferInsert, "idx"> & { idx?: number }) {
  let idx = v.idx
  if (idx == null) {
    const [row] = await db.select({ m: max(s.lessons.idx) }).from(s.lessons).where(eq(s.lessons.subjectId, v.subjectId))
    idx = (row?.m ?? 0) + 1
  }
  return db.insert(s.lessons).values({ ...v, idx })
}
export const updateLesson = (db: Db, id: string, v: Partial<typeof s.lessons.$inferInsert>) =>
  db.update(s.lessons).set(v).where(eq(s.lessons.id, id))
export const deleteLesson = (db: Db, id: string) => db.delete(s.lessons).where(eq(s.lessons.id, id))

// ── PDFs (fileHash derived from url for the unique(examId,fileHash) key) ──────
export const listPdfs = (db: Db, examId: string) =>
  db.select().from(s.pdfs).where(eq(s.pdfs.examId, examId)).orderBy(asc(s.pdfs.filename))
export const createPdf = (db: Db, v: { examId: string; filename: string; url: string }) =>
  db.insert(s.pdfs).values({ ...v, fileHash: sha(v.url) })
export const deletePdf = (db: Db, id: string) => db.delete(s.pdfs).where(eq(s.pdfs.id, id))

// ── Tests ────────────────────────────────────────────────────────────────────
export const listTests = (db: Db, examId: string) =>
  db.select().from(s.testForms).where(eq(s.testForms.examId, examId)).orderBy(asc(s.testForms.setName))
export const createTest = (db: Db, v: typeof s.testForms.$inferInsert) => db.insert(s.testForms).values(v)
export const deleteTest = (db: Db, id: string) => db.delete(s.testForms).where(eq(s.testForms.id, id))

// ── Gallery ──────────────────────────────────────────────────────────────────
export const listGallery = (db: Db, examId: string) =>
  db.select().from(s.galleryImages).where(eq(s.galleryImages.examId, examId)).orderBy(asc(s.galleryImages.createdAt))
export const createGalleryImage = (db: Db, v: { examId: string; url: string }) =>
  db.insert(s.galleryImages).values(v)
export const deleteGalleryImage = (db: Db, id: string) => db.delete(s.galleryImages).where(eq(s.galleryImages.id, id))
