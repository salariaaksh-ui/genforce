import Link from "next/link"
import { notFound } from "next/navigation"
import { requireActiveExam, getBatch, listSubjects } from "@/lib/db/queries"
import { Breadcrumbs } from "@/components/app/breadcrumbs"

export default async function BatchPage({
  params,
}: {
  params: Promise<{ batchId: string }>
}) {
  const { batchId } = await params
  const { examId } = await requireActiveExam()
  const batch = await getBatch(batchId, examId)
  if (!batch) notFound()
  const subjectList = await listSubjects(batch.id)

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: batch.name }]}
      />
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">{batch.name}</h1>
        {batch.cycle && (
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {batch.cycle}
          </p>
        )}
      </div>

      {subjectList.length === 0 ? (
        <p className="text-muted-foreground">No subjects in this batch yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {subjectList.map((s) => (
            <Link
              key={s.id}
              href={`/subjects/${s.id}`}
              className="group rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              <p className="text-xl font-semibold">{s.name}</p>
              {s.teacher && (
                <p className="mt-1 text-sm text-muted-foreground">with {s.teacher}</p>
              )}
              <span className="mt-6 block font-mono text-xs uppercase tracking-widest text-primary">
                View lessons →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
