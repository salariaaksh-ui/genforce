import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { requireUser, needsOnboarding } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { selectExam } from "@/app/actions/exam"
import { EXAM_SLUGS, EXAM_LABEL } from "@/lib/exams"
import { Logo } from "@/components/brand/logo"
import { Reveal } from "@/components/motion/reveal"

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
      <Reveal onMount>
        <Logo />
      </Reveal>
      <Reveal onMount delay={0.08}>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            One step
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight">Choose your exam</h1>
          <p className="mt-3 text-muted-foreground">
            Your dashboard reshapes around it. You can switch anytime from the top bar.
          </p>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 gap-4">
        {EXAM_SLUGS.map((slug, i) => (
          <Reveal key={slug} onMount delay={0.16 + i * 0.06}>
            <form action={selectExam.bind(null, slug)}>
              <button
                type="submit"
                className="w-full rounded-2xl border bg-card p-6 text-left transition hover:-translate-y-0.5 hover:border-primary/40 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-2xl font-extrabold tracking-tight">
                  {EXAM_LABEL[slug]}
                </span>
              </button>
            </form>
          </Reveal>
        ))}
      </div>
    </main>
  )
}
