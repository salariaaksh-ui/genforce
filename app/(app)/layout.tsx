import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { requireUser, needsOnboarding } from "@/lib/auth/guards"
import { isAdminEmail } from "@/lib/auth/admin"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { TopBar } from "@/components/app/top-bar"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sessionUser = await requireUser()
  const row = await db.query.users.findFirst({ where: eq(users.id, sessionUser.id) })
  if (!row || needsOnboarding({ activeExamId: row.activeExamId })) redirect("/onboarding")
  return (
    <div className="min-h-dvh">
      <TopBar userName={row.name ?? "Student"} activeExamId={row.activeExamId!} isAdmin={isAdminEmail(sessionUser.email)} />
      <main id="main-content" className="mx-auto max-w-5xl p-6">
        {children}
      </main>
    </div>
  )
}
