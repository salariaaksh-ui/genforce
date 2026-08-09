import { and, asc, eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { db } from "./index"
import {
  users,
  batches,
  subjects,
  lessons,
  pdfs,
  galleryImages,
  testForms,
} from "./schema"
import { requireUser } from "@/lib/auth/guards"

/**
 * Onboarded user + their active exam id. The (app) layout already gates on
 * onboarding, but content queries call this directly so the exam scope is
 * enforced at the query layer, not just the layout.
 *
 * ponytail: no plan/payment gate yet — any onboarded user sees content.
 * Add a plans.status check here in Phase 3 (Razorpay).
 */
export async function requireActiveExam() {
  const sessionUser = await requireUser()
  const user = await db.query.users.findFirst({ where: eq(users.id, sessionUser.id) })
  if (!user?.activeExamId) redirect("/onboarding")
  return { user, examId: user.activeExamId }
}

export function listBatches(examId: string) {
  return db.query.batches.findMany({
    where: eq(batches.examId, examId),
    orderBy: [asc(batches.sort)],
  })
}

/** Scoped by examId so a user can't reach another exam's batch by guessing ids. */
export function getBatch(batchId: string, examId: string) {
  return db.query.batches.findFirst({
    where: and(eq(batches.id, batchId), eq(batches.examId, examId)),
  })
}

export function listSubjects(batchId: string) {
  return db.query.subjects.findMany({
    where: eq(subjects.batchId, batchId),
    orderBy: [asc(subjects.sort)],
  })
}

/** Joins up to batch so ownership is checked against the caller's exam. */
export async function getSubject(subjectId: string, examId: string) {
  const rows = await db
    .select({ subject: subjects, batch: batches })
    .from(subjects)
    .innerJoin(batches, eq(subjects.batchId, batches.id))
    .where(and(eq(subjects.id, subjectId), eq(batches.examId, examId)))
    .limit(1)
  return rows[0]
}

export function listLessons(subjectId: string) {
  return db.query.lessons.findMany({
    where: eq(lessons.subjectId, subjectId),
    orderBy: [asc(lessons.idx)],
  })
}

/** Joins subject → batch so ownership is checked against the caller's exam. */
export async function getLesson(lessonId: string, examId: string) {
  const rows = await db
    .select({ lesson: lessons, subject: subjects, batch: batches })
    .from(lessons)
    .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
    .innerJoin(batches, eq(subjects.batchId, batches.id))
    .where(and(eq(lessons.id, lessonId), eq(batches.examId, examId)))
    .limit(1)
  return rows[0]
}

export function listPdfs(examId: string) {
  return db.query.pdfs.findMany({
    where: eq(pdfs.examId, examId),
    orderBy: [asc(pdfs.filename)],
  })
}

export function listGallery(examId: string) {
  return db.query.galleryImages.findMany({ where: eq(galleryImages.examId, examId) })
}

export function listTests(examId: string) {
  return db.query.testForms.findMany({ where: eq(testForms.examId, examId) })
}
