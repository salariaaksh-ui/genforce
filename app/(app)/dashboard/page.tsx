import { eq } from "drizzle-orm"
import { requireUser } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { users, batches } from "@/lib/db/schema"

export const metadata = { title: "Dashboard" }

export default async function Dashboard() {
  const sessionUser = await requireUser()
  const row = await db.query.users.findFirst({ where: eq(users.id, sessionUser.id) })
  const list = row?.activeExamId
    ? await db.query.batches.findMany({ where: eq(batches.examId, row.activeExamId) })
    : []
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">Choose your path</h1>
        <div className="mt-4 flex gap-3">
          {["PDFs", "Gallery", "Tests"].map((p) => (
            <button
              key={p}
              disabled
              title="Coming soon"
              className="rounded-md border px-4 py-2 opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Available batches</h2>
        {list.length === 0 ? (
          <p className="mt-2 text-muted-foreground">No batches yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {list.map((b) => (
              <li key={b.id} className="rounded-md border p-3">
                {b.name}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
