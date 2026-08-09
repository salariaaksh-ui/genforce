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
        <div className="mt-6 grid gap-px border bg-border sm:grid-cols-3">
          {RESOURCES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group bg-background p-6 transition-colors hover:bg-accent"
            >
              <p className="font-display text-xl font-semibold">{r.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              <span className="mt-4 block font-mono text-xs uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
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
          <ul className="mt-6 divide-y border-y">
            {batchList.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/batches/${b.id}`}
                  className="flex items-center justify-between gap-4 py-4 hover:text-foreground"
                >
                  <span className="font-display text-lg font-semibold">{b.name}</span>
                  <span className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {b.cycle && <span>{b.cycle}</span>}
                    <span aria-hidden>→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
