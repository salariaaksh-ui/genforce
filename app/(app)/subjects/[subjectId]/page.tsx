import Link from "next/link"
import { notFound } from "next/navigation"
import { PlayCircle } from "lucide-react"
import { requireActiveExam, getSubject, listLessons, assertBatchUnlocked } from "@/lib/db/queries"
import { Breadcrumbs } from "@/components/app/breadcrumbs"
import { Reveal } from "@/components/motion/reveal"
import { EmptyState } from "@/components/app/empty-state"
import { formatDuration, formatDate, formatFileSize } from "@/lib/format"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subjectId: string }>
}) {
  const { subjectId } = await params
  const { examId } = await requireActiveExam()
  const found = await getSubject(subjectId, examId)
  return { title: found?.subject.name ?? "Subject" }
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>
}) {
  const { subjectId } = await params
  const { user, examId } = await requireActiveExam()
  const found = await getSubject(subjectId, examId)
  if (!found) notFound()
  const { subject, batch } = found
  await assertBatchUnlocked(batch, user.id)
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
      <Reveal onMount>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{subject.name}</h1>
          {subject.teacher && (
            <p className="mt-1 text-muted-foreground">with {subject.teacher}</p>
          )}
        </div>
      </Reveal>

      {lessonList.length === 0 ? (
        <EmptyState
          icon={<PlayCircle className="size-5" />}
          title="No lessons published yet"
          hint="Recorded classes for this subject will appear here."
        />
      ) : (
        <ol className="divide-y overflow-hidden rounded-2xl border">
          {lessonList.map((l) => (
            <li key={l.id}>
              <Link
                href={`/lessons/${l.id}`}
                className="group flex items-center gap-4 bg-card px-5 py-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <span className="grid size-8 flex-none place-items-center rounded-full bg-secondary font-mono text-xs tabular-nums text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {String(l.idx).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{l.title}</span>
                  {(() => {
                    const meta = [
                      formatDuration(l.durationSec),
                      formatDate(l.recordedOn),
                      formatFileSize(l.sizeBytes),
                    ].filter(Boolean)
                    return meta.length > 0 ? (
                      <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        {meta.join(" · ")}
                      </span>
                    ) : null
                  })()}
                </span>
                <span aria-hidden className="flex-none text-primary transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
