import { ClipboardList } from "lucide-react"
import { requireActiveExam, listTests } from "@/lib/db/queries"
import { Breadcrumbs } from "@/components/app/breadcrumbs"
import { Reveal } from "@/components/motion/reveal"
import { EmptyState } from "@/components/app/empty-state"

export const metadata = { title: "Tests" }

export default async function TestsPage() {
  const { examId } = await requireActiveExam()
  const forms = await listTests(examId)

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Tests" }]}
      />
      <Reveal onMount>
        <h1 className="text-3xl font-extrabold tracking-tight">Practice tests</h1>
      </Reveal>

      {forms.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-5" />}
          title="No tests available yet"
          hint="Timed practice papers will appear here when released."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {forms.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.05} className="h-full">
            <div
              className="flex h-full items-center justify-between gap-4 rounded-2xl border bg-card p-5"
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
                className="flex-none rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[.98] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Start →
              </a>
            </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}
