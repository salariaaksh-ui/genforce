import { eq } from "drizzle-orm"
import { requireUser } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { users, plans, exams } from "@/lib/db/schema"
import { updatePhone } from "@/app/actions/profile"
import { signOut } from "@/auth"

export const metadata = { title: "Profile" }

export default async function Profile() {
  const sessionUser = await requireUser()
  const row = await db.query.users.findFirst({ where: eq(users.id, sessionUser.id) })
  const myPlans = await db
    .select({ status: plans.status, expiresAt: plans.expiresAt, exam: exams.name })
    .from(plans)
    .innerJoin(exams, eq(plans.examId, exams.id))
    .where(eq(plans.userId, sessionUser.id))
  return (
    <main id="main-content" className="mx-auto max-w-lg space-y-8 p-6">
      <section>
        <h1 className="text-2xl font-semibold">{row?.name}</h1>
        <p className="text-muted-foreground">{row?.email}</p>
      </section>
      <section>
        <h2 className="font-semibold">Phone</h2>
        <form action={updatePhone} className="mt-2 flex gap-2">
          <input
            name="phone"
            defaultValue={row?.phone ?? ""}
            inputMode="numeric"
            placeholder="10-digit number"
            className="rounded-md border px-3 py-2"
          />
          <button type="submit" className="rounded-md border px-4 py-2">
            Save
          </button>
        </form>
      </section>
      <section>
        <h2 className="font-semibold">My plans</h2>
        {myPlans.length === 0 ? (
          <p className="text-muted-foreground">No active plans.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {myPlans.map((p, i) => (
              <li key={i} className="rounded-md border p-3">
                {p.exam} — {p.status}
                {p.expiresAt ? ` (expires ${p.expiresAt.toDateString()})` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
      <form
        action={async () => {
          "use server"
          await signOut({ redirectTo: "/" })
        }}
      >
        <button type="submit" className="rounded-md border px-4 py-2">
          Log out
        </button>
      </form>
    </main>
  )
}
