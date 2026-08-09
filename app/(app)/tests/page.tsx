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
        <ul className="divide-y border-y">
          {forms.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-display font-semibold">{t.setName ?? "Practice set"}</p>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {[t.timeLimitMin ? `${t.timeLimitMin} min` : null, t.formDate]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <a
                href={t.formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm bg-primary px-4 py-2 font-display text-sm font-semibold text-primary-foreground hover:opacity-90"
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
