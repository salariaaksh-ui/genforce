"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth/admin"
import * as a from "@/lib/db/admin"

// ── FormData parsing helpers ────────────────────────────────────────────────
function str(fd: FormData, k: string): string | null {
  const v = String(fd.get(k) ?? "").trim()
  return v || null
}
function reqStr(fd: FormData, k: string): string {
  const v = str(fd, k)
  if (!v) throw new Error(`${k} is required`)
  return v
}
function int(fd: FormData, k: string): number | null {
  const v = str(fd, k)
  if (v == null) return null
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

const MB = 1024 * 1024

// ── Batches ─────────────────────────────────────────────────────────────────
export async function createBatchAction(fd: FormData) {
  await requireAdmin()
  await a.createBatch(db, {
    examId: reqStr(fd, "examId"),
    name: reqStr(fd, "name"),
    cycle: str(fd, "cycle"),
    thumbnail: str(fd, "thumbnail"),
    description: str(fd, "description"),
    priceInr: int(fd, "priceInr"),
    accessDays: int(fd, "accessDays"),
    sort: int(fd, "sort") ?? 0,
  })
  revalidatePath("/admin/batches")
  revalidatePath("/dashboard")
}
export async function updateBatchAction(fd: FormData) {
  await requireAdmin()
  await a.updateBatch(db, reqStr(fd, "id"), {
    name: reqStr(fd, "name"),
    cycle: str(fd, "cycle"),
    thumbnail: str(fd, "thumbnail"),
    description: str(fd, "description"),
    priceInr: int(fd, "priceInr"),
    accessDays: int(fd, "accessDays"),
    sort: int(fd, "sort") ?? 0,
  })
  revalidatePath("/admin/batches")
  revalidatePath("/dashboard")
}
export async function deleteBatchAction(fd: FormData) {
  await requireAdmin()
  await a.deleteBatch(db, reqStr(fd, "id"))
  revalidatePath("/admin/batches")
  revalidatePath("/dashboard")
}

// ── Subjects ─────────────────────────────────────────────────────────────────
export async function createSubjectAction(fd: FormData) {
  await requireAdmin()
  await a.createSubject(db, {
    batchId: reqStr(fd, "batchId"),
    name: reqStr(fd, "name"),
    teacher: str(fd, "teacher"),
    coverImage: str(fd, "coverImage"),
    sort: int(fd, "sort") ?? 0,
  })
  revalidatePath("/admin/subjects")
}
export async function updateSubjectAction(fd: FormData) {
  await requireAdmin()
  await a.updateSubject(db, reqStr(fd, "id"), {
    name: reqStr(fd, "name"),
    teacher: str(fd, "teacher"),
    coverImage: str(fd, "coverImage"),
    sort: int(fd, "sort") ?? 0,
  })
  revalidatePath("/admin/subjects")
}
export async function deleteSubjectAction(fd: FormData) {
  await requireAdmin()
  await a.deleteSubject(db, reqStr(fd, "id"))
  revalidatePath("/admin/subjects")
}

// ── Lessons (team enters duration in MINUTES, size in MB — converted here) ────
export async function createLessonAction(fd: FormData) {
  await requireAdmin()
  const durationMin = int(fd, "durationMin")
  const sizeMb = int(fd, "sizeMb")
  await a.createLesson(db, {
    subjectId: reqStr(fd, "subjectId"),
    title: reqStr(fd, "title"),
    source: reqStr(fd, "source"),
    playUrl: reqStr(fd, "playUrl"),
    durationSec: durationMin != null ? durationMin * 60 : null,
    recordedOn: str(fd, "recordedOn"),
    sizeBytes: sizeMb != null ? sizeMb * MB : null,
  })
  revalidatePath("/admin/lessons")
}
export async function updateLessonAction(fd: FormData) {
  await requireAdmin()
  const durationMin = int(fd, "durationMin")
  const sizeMb = int(fd, "sizeMb")
  await a.updateLesson(db, reqStr(fd, "id"), {
    title: reqStr(fd, "title"),
    source: reqStr(fd, "source"),
    playUrl: reqStr(fd, "playUrl"),
    durationSec: durationMin != null ? durationMin * 60 : null,
    recordedOn: str(fd, "recordedOn"),
    sizeBytes: sizeMb != null ? sizeMb * MB : null,
  })
  revalidatePath("/admin/lessons")
}
export async function deleteLessonAction(fd: FormData) {
  await requireAdmin()
  await a.deleteLesson(db, reqStr(fd, "id"))
  revalidatePath("/admin/lessons")
}

// ── PDFs ─────────────────────────────────────────────────────────────────────
export async function createPdfAction(fd: FormData) {
  await requireAdmin()
  await a.createPdf(db, { examId: reqStr(fd, "examId"), filename: reqStr(fd, "filename"), url: reqStr(fd, "url") })
  revalidatePath("/admin/pdfs")
}
export async function deletePdfAction(fd: FormData) {
  await requireAdmin()
  await a.deletePdf(db, reqStr(fd, "id"))
  revalidatePath("/admin/pdfs")
}

// ── Tests ────────────────────────────────────────────────────────────────────
export async function createTestAction(fd: FormData) {
  await requireAdmin()
  await a.createTest(db, {
    examId: reqStr(fd, "examId"),
    setName: str(fd, "setName"),
    timeLimitMin: int(fd, "timeLimitMin"),
    formUrl: reqStr(fd, "formUrl"),
    formDate: str(fd, "formDate"),
  })
  revalidatePath("/admin/tests")
}
export async function deleteTestAction(fd: FormData) {
  await requireAdmin()
  await a.deleteTest(db, reqStr(fd, "id"))
  revalidatePath("/admin/tests")
}

// ── Gallery ──────────────────────────────────────────────────────────────────
export async function createGalleryAction(fd: FormData) {
  await requireAdmin()
  await a.createGalleryImage(db, { examId: reqStr(fd, "examId"), url: reqStr(fd, "url") })
  revalidatePath("/admin/gallery")
}
export async function deleteGalleryAction(fd: FormData) {
  await requireAdmin()
  await a.deleteGalleryImage(db, reqStr(fd, "id"))
  revalidatePath("/admin/gallery")
}
