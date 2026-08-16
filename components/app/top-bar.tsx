import Link from "next/link"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { exams } from "@/lib/db/schema"
import { Logo } from "@/components/brand/logo"
import { ExamSwitcher } from "./exam-switcher"
import { ThemeToggle } from "./theme-toggle"

export async function TopBar({
  userName,
  activeExamId,
  isAdmin = false,
}: {
  userName: string
  activeExamId: string
  isAdmin?: boolean
}) {
  const exam = await db.query.exams.findFirst({ where: eq(exams.id, activeExamId) })
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/dashboard" aria-label="Genforce home">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Admin
            </Link>
          )}
          <ExamSwitcher currentLabel={exam?.name ?? "Exam"} />
          <ThemeToggle />
          <Link
            href="/profile"
            aria-label="Your profile"
            className="flex size-9 items-center justify-center rounded-full border font-mono text-xs font-semibold uppercase hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {userName[0]?.toUpperCase() ?? "U"}
          </Link>
        </div>
      </div>
    </header>
  )
}
