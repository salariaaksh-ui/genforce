import Link from "next/link"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { exams } from "@/lib/db/schema"
import { ExamSwitcher } from "./exam-switcher"

export async function TopBar({
  userName,
  activeExamId,
}: {
  userName: string
  activeExamId: string
}) {
  const exam = await db.query.exams.findFirst({ where: eq(exams.id, activeExamId) })
  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <Link href="/dashboard" className="text-lg font-semibold">
        Genforce
      </Link>
      <div className="flex items-center gap-3">
        <ExamSwitcher currentLabel={exam?.name ?? "Exam"} />
        <button
          aria-label="Notifications"
          className="rounded-md border px-2 py-1"
          disabled
          title="No notifications"
        >
          🔔
        </button>
        <Link
          href="/profile"
          aria-label="Account"
          className="rounded-md border px-2 py-1 font-medium"
        >
          {userName[0]?.toUpperCase()}
        </Link>
      </div>
    </header>
  )
}
