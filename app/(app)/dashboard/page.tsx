import Link from "next/link"
import { Layers } from "lucide-react"
import { requireActiveExam, listBatchesWithAccess } from "@/lib/db/queries"
import { Reveal } from "@/components/motion/reveal"
import { EmptyState } from "@/components/app/empty-state"
import { CourseCard } from "@/components/app/course-card"

export const metadata = { title: "Dashboard" }

const RESOURCES = [
  { label: "PDFs", href: "/pdfs", desc: "Notes and papers" },
  { label: "Gallery", href: "/gallery", desc: "Reference sheets" },
  { label: "Tests", href: "/tests", desc: "Practice papers" },
]

export default async function Dashboard() {
  const { user, examId } = await requireActiveExam()
  const batchList = await listBatchesWithAccess(examId, user.id)

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
            Available batches
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
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {batchList.map((b, i) => (
              <Reveal key={b.id} delay={i * 0.05}>
                <CourseCard
                  href={b.unlocked ? `/batches/${b.id}` : `/checkout/${b.id}`}
                  name={b.name}
                  cycle={b.cycle}
                  thumbnail={b.thumbnail}
                  locked={!b.unlocked}
                  priceInr={b.priceInr}
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
