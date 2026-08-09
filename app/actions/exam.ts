"use server"

import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users, exams } from "@/lib/db/schema"
import { requireUser } from "@/lib/auth/guards"
import { isExamSlug } from "@/lib/exams"

export async function selectExam(slug: string) {
  if (!isExamSlug(slug)) throw new Error("invalid exam")
  const user = await requireUser()
  const exam = await db.query.exams.findFirst({ where: eq(exams.slug, slug) })
  if (!exam) throw new Error("exam not found")
  await db.update(users).set({ activeExamId: exam.id }).where(eq(users.id, user.id))
  redirect("/dashboard")
}
