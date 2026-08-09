import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { requireUser, needsOnboarding } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { selectExam } from "@/app/actions/exam"
import { EXAM_SLUGS, EXAM_LABEL } from "@/lib/exams"
import { Logo } from "@/components/brand/logo"

export const metadata = { title: "Choose your exam" }

export default async function Onboarding() {
  const sessionUser = await requireUser()
  const row = await db.query.users.findFirst({ where: eq(users.id, sessionUser.id) })
  if (row && !needsOnboarding({ activeExamId: row.activeExamId })) redirect("/dashboard")
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-10 p-8"
    >
      <Logo />
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          One step
        </p>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight">
          Choose your exam
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your dashboard reshapes around it. You can switch anytime from the top bar.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-px border bg-border">
        {EXAM_SLUGS.map((slug) => (
          <form key={slug} action={selectExam.bind(null, slug)}>
            <button
              type="submit"
              className="w-full bg-background p-6 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <span className="font-display text-2xl font-extrabold tracking-tight">
                {EXAM_LABEL[slug]}
              </span>
            </button>
          </form>
        ))}
      </div>
    </main>
  )
}
