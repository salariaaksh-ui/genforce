"use server"

import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users, exams } from "@/lib/db/schema"
import { requireUser } from "@/lib/auth/guards"
import { isExamSlug } from "@/lib/exams"

export async function selectExam(slug: string) {
  const user = await requireUser()
  // Bad slug / missing exam: bounce back to onboarding instead of throwing —
  // onboarding and the exam switcher live outside the (app) error boundary, so
  // a thrown Server Action would crash the page to the global error screen.
  if (!isExamSlug(slug)) redirect("/onboarding")
  const exam = await db.query.exams.findFirst({ where: eq(exams.slug, slug) })
  if (!exam) redirect("/onboarding")
  await db.update(users).set({ activeExamId: exam.id }).where(eq(users.id, user.id))
  redirect("/dashboard")
}
