import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { requireUser, needsOnboarding } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { selectExam } from "@/app/actions/exam"
import { EXAM_SLUGS, EXAM_LABEL } from "@/lib/exams"

export const metadata = { title: "Choose your exam" }

export default async function Onboarding() {
  const sessionUser = await requireUser()
  const row = await db.query.users.findFirst({ where: eq(users.id, sessionUser.id) })
  if (row && !needsOnboarding({ activeExamId: row.activeExamId })) redirect("/dashboard")
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-8"
    >
      <h1 className="text-2xl font-semibold">Choose your exam</h1>
      <div className="grid grid-cols-2 gap-3">
        {EXAM_SLUGS.map((slug) => (
          <form key={slug} action={selectExam.bind(null, slug)}>
            <button
              type="submit"
              className="w-full rounded-md border p-4 font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {EXAM_LABEL[slug]}
            </button>
          </form>
        ))}
      </div>
    </main>
  )
}
