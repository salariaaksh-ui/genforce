import { requireActiveExam, listTests } from "@/lib/db/queries"
import { Breadcrumbs } from "@/components/app/breadcrumbs"

export const metadata = { title: "Tests" }

export default async function TestsPage() {
  const { examId } = await requireActiveExam()
  const forms = await listTests(examId)

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Tests" }]}
      />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Practice tests</h1>

      {forms.length === 0 ? (
        <p className="text-muted-foreground">No tests available yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {forms.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5"
            >
              <div>
                <p className="font-semibold">{t.setName ?? "Practice set"}</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {[t.timeLimitMin ? `${t.timeLimitMin} min` : null, t.formDate]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <a
                href={t.formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-none rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Start →
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
