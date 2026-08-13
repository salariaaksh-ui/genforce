import Link from "next/link"
import { Layers } from "lucide-react"
import { requireActiveExam, listBatches } from "@/lib/db/queries"
import { Reveal } from "@/components/motion/reveal"
import { EmptyState } from "@/components/app/empty-state"

export const metadata = { title: "Dashboard" }

const RESOURCES = [
  { label: "PDFs", href: "/pdfs", desc: "Notes and papers" },
  { label: "Gallery", href: "/gallery", desc: "Reference sheets" },
  { label: "Tests", href: "/tests", desc: "Practice papers" },
]

export default async function Dashboard() {
  const { examId } = await requireActiveExam()
  const batchList = await listBatches(examId)

  return (
    <div className="space-y-12">
      <h1 className="sr-only">Dashboard</h1>
      <section>
        <Reveal onMount>
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Study material
          </h2>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {RESOURCES.map((r, i) => (
            <Reveal key={r.href} onMount delay={0.05 + i * 0.06}>
              <Link
                href={r.href}
                className="group block rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40"
              >
                <p className="text-xl font-semibold">{r.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                <span className="mt-6 block font-mono text-xs uppercase tracking-widest text-primary">
                  Open →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section>
        <Reveal>
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Batches
          </h2>
        </Reveal>
        {batchList.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<Layers className="size-5" />}
              title="No batches yet"
              hint="Once your batch is published it shows up here."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {batchList.map((b, i) => (
              <Reveal key={b.id} delay={i * 0.05}>
                <Link
                  href={`/batches/${b.id}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <span className="text-lg font-semibold">{b.name}</span>
                  <span className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {b.cycle && <span>{b.cycle}</span>}
                    <span aria-hidden className="text-primary transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
