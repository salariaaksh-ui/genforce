import Link from "next/link"
import { notFound } from "next/navigation"
import { requireActiveExam, getSubject, listLessons } from "@/lib/db/queries"
import { Breadcrumbs } from "@/components/app/breadcrumbs"

function fmtDuration(sec: number | null) {
  if (!sec) return null
  return `${Math.round(sec / 60)} min`
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>
}) {
  const { subjectId } = await params
  const { examId } = await requireActiveExam()
  const found = await getSubject(subjectId, examId)
  if (!found) notFound()
  const { subject, batch } = found
  const lessonList = await listLessons(subject.id)

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: batch.name, href: `/batches/${batch.id}` },
          { label: subject.name },
        ]}
      />
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">{subject.name}</h1>
        {subject.teacher && (
          <p className="mt-1 text-muted-foreground">with {subject.teacher}</p>
        )}
      </div>

      {lessonList.length === 0 ? (
        <p className="text-muted-foreground">No lessons published yet.</p>
      ) : (
        <ol className="divide-y overflow-hidden rounded-2xl border">
          {lessonList.map((l) => (
            <li key={l.id}>
              <Link
                href={`/lessons/${l.id}`}
                className="flex items-center gap-4 bg-card px-5 py-4 transition-colors hover:bg-accent"
              >
                <span className="grid size-8 flex-none place-items-center rounded-full bg-secondary font-mono text-xs tabular-nums text-secondary-foreground">
                  {String(l.idx).padStart(2, "0")}
                </span>
                <span className="flex-1 font-semibold">{l.title}</span>
                {fmtDuration(l.durationSec) && (
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {fmtDuration(l.durationSec)}
                  </span>
                )}
                <span aria-hidden className="text-primary">→</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
