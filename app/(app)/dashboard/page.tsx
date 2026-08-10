import Link from "next/link"
import { requireActiveExam, listBatches } from "@/lib/db/queries"

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
      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Study material
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {RESOURCES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              <p className="text-xl font-semibold">{r.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              <span className="mt-6 block font-mono text-xs uppercase tracking-widest text-primary">
                Open →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Batches
        </h2>
        {batchList.length === 0 ? (
          <p className="mt-6 text-muted-foreground">
            No batches yet. Check back once your batch is published.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {batchList.map((b) => (
              <Link
                key={b.id}
                href={`/batches/${b.id}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40"
              >
                <span className="text-lg font-semibold">{b.name}</span>
                <span className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {b.cycle && <span>{b.cycle}</span>}
                  <span aria-hidden className="text-primary">→</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
