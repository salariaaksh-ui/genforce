import { cache } from "react"
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
  entitlements,
} from "./schema"
import { requireUser } from "@/lib/auth/guards"
import { isPaid, isLive, isUnlocked } from "@/lib/payments/gate"

/**
 * Onboarded user + their active exam id. The (app) layout already gates on
 * onboarding, but content queries call this directly so the exam scope is
 * enforced at the query layer, not just the layout.
 */
export const requireActiveExam = cache(async () => {
  const sessionUser = await requireUser()
  const user = await db.query.users.findFirst({ where: eq(users.id, sessionUser.id) })
  if (!user?.activeExamId) redirect("/onboarding")
  return { user, examId: user.activeExamId }
})

/** The caller's entitlement row for a batch, if any (live or expired). */
export const getEntitlement = cache((userId: string, batchId: string) =>
  db.query.entitlements.findFirst({
    where: and(eq(entitlements.userId, userId), eq(entitlements.batchId, batchId)),
  })
)

/**
 * Hard server-side gate for a paid batch's deep content (subjects/lessons).
 * A non-entitled user hitting the URL directly is redirected to checkout.
 * Free batches pass through. This is the authoritative gate — UI lock states
 * are cosmetic.
 */
export async function assertBatchUnlocked(
  batch: { id: string; priceInr: number | null },
  userId: string
) {
  if (!isPaid(batch)) return
  const ent = await getEntitlement(userId, batch.id)
  if (!isLive(ent)) redirect(`/checkout/${batch.id}`)
}

export function listBatches(examId: string) {
  return db.query.batches.findMany({
    where: eq(batches.examId, examId),
    orderBy: [asc(batches.sort)],
  })
}

/** Batches for the exam, each tagged with whether the caller can open it. Paid
 *  batches without a live entitlement come back `unlocked: false`. */
export async function listBatchesWithAccess(examId: string, userId: string) {
  const list = await listBatches(examId)
  const ents = await db.query.entitlements.findMany({
    where: eq(entitlements.userId, userId),
  })
  const byBatch = new Map(ents.map((e) => [e.batchId, e]))
  return list.map((b) => ({ ...b, unlocked: isUnlocked(b, byBatch.get(b.id)) }))
}

/** Scoped by examId so a user can't reach another exam's batch by guessing ids. */
export const getBatch = cache((batchId: string, examId: string) =>
  db.query.batches.findFirst({
    where: and(eq(batches.id, batchId), eq(batches.examId, examId)),
  })
)

export function listSubjects(batchId: string) {
  return db.query.subjects.findMany({
    where: eq(subjects.batchId, batchId),
    orderBy: [asc(subjects.sort)],
  })
}

/** Joins up to batch so ownership is checked against the caller's exam. */
export const getSubject = cache(async (subjectId: string, examId: string) => {
  const rows = await db
    .select({ subject: subjects, batch: batches })
    .from(subjects)
    .innerJoin(batches, eq(subjects.batchId, batches.id))
    .where(and(eq(subjects.id, subjectId), eq(batches.examId, examId)))
    .limit(1)
  return rows[0]
})

export function listLessons(subjectId: string) {
  return db.query.lessons.findMany({
    where: eq(lessons.subjectId, subjectId),
    orderBy: [asc(lessons.idx)],
  })
}

/** Joins subject → batch so ownership is checked against the caller's exam. */
export const getLesson = cache(async (lessonId: string, examId: string) => {
  const rows = await db
    .select({ lesson: lessons, subject: subjects, batch: batches })
    .from(lessons)
    .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
    .innerJoin(batches, eq(subjects.batchId, batches.id))
    .where(and(eq(lessons.id, lessonId), eq(batches.examId, examId)))
    .limit(1)
  return rows[0]
})

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
