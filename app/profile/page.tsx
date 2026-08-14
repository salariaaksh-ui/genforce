import { eq } from "drizzle-orm"
import { requireUser } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { users, entitlements, batches } from "@/lib/db/schema"
import { updatePhone } from "@/app/actions/profile"
import { signOut } from "@/auth"
import { Breadcrumbs } from "@/components/app/breadcrumbs"

export const metadata = { title: "Profile" }

export default async function Profile() {
  const sessionUser = await requireUser()
  const row = await db.query.users.findFirst({ where: eq(users.id, sessionUser.id) })
  const myCourses = await db
    .select({ course: batches.name, expiresAt: entitlements.expiresAt })
    .from(entitlements)
    .innerJoin(batches, eq(entitlements.batchId, batches.id))
    .where(eq(entitlements.userId, sessionUser.id))

  return (
    <main id="main-content" className="mx-auto max-w-lg space-y-10 p-6 py-10">
      <Breadcrumbs
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Profile" }]}
      />

      <section>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {row?.name ?? "Student"}
        </h1>
        <p className="mt-1 text-muted-foreground">{row?.email}</p>
      </section>

      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Phone
        </h2>
        <form action={updatePhone} className="mt-3 flex gap-2">
          <input
            name="phone"
            defaultValue={row?.phone ?? ""}
            inputMode="numeric"
            autoComplete="tel"
            placeholder="10-digit number"
            aria-label="Phone number"
            className="flex-1 rounded-xl border bg-card px-4 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[.98] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Save
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          My courses
        </h2>
        {myCourses.length === 0 ? (
          <p className="mt-3 text-muted-foreground">No courses yet.</p>
        ) : (
          <ul className="mt-3 divide-y overflow-hidden rounded-2xl border">
            {myCourses.map((c, i) => (
              <li key={i} className="flex items-center justify-between gap-4 bg-card px-5 py-3">
                <span className="font-semibold">{c.course}</span>
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {c.expiresAt ? `expires ${c.expiresAt.toDateString()}` : "Lifetime"}
                </span>
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
        <button
          type="submit"
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Log out
        </button>
      </form>
    </main>
  )
}
