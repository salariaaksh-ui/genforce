import { notFound } from "next/navigation"
import { requireActiveExam, getLesson } from "@/lib/db/queries"
import { Breadcrumbs } from "@/components/app/breadcrumbs"
import { LessonPlayer } from "@/components/app/lesson-player"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>
}) {
  const { lessonId } = await params
  const { examId } = await requireActiveExam()
  const found = await getLesson(lessonId, examId)
  if (!found) notFound()
  const { lesson, subject, batch } = found

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: batch.name, href: `/batches/${batch.id}` },
          { label: subject.name, href: `/subjects/${subject.id}` },
          { label: `Lesson ${lesson.idx}` },
        ]}
      />
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          {lesson.title}
        </h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {subject.name}
          {lesson.recordedOn ? ` · ${lesson.recordedOn}` : ""}
        </p>
      </div>

      {lesson.playUrl ? (
        <LessonPlayer src={lesson.playUrl} title={lesson.title} />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-2xl border bg-muted text-muted-foreground">
          Video not available yet.
        </div>
      )}
    </div>
  )
}
