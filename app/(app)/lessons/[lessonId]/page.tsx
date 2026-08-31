import { notFound } from "next/navigation"
import { requireActiveExam, getLesson, assertBatchUnlocked } from "@/lib/db/queries"
import { presignDownload, r2Configured } from "@/lib/storage/r2"
import { Breadcrumbs } from "@/components/app/breadcrumbs"
import { LessonPlayer } from "@/components/app/lesson-player"
import { Reveal } from "@/components/motion/reveal"
import { formatDuration, formatDate, formatFileSize } from "@/lib/format"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonId: string }>
}) {
  const { lessonId } = await params
  const { examId } = await requireActiveExam()
  const found = await getLesson(lessonId, examId)
  return { title: found?.lesson.title ?? "Lesson" }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>
}) {
  const { lessonId } = await params
  const { user, examId } = await requireActiveExam()
  const found = await getLesson(lessonId, examId)
  if (!found) notFound()
  const { lesson, subject, batch } = found
  await assertBatchUnlocked(batch, user.id)

  // R2-hosted lessons store an object key in playUrl. The entitlement gate above
  // has passed, so mint a short-lived signed GET URL and stream it in <video>.
  // Link sources (youtube/vimeo/zoom) keep the iframe embed.
  const isR2 = lesson.source === "r2" && Boolean(lesson.playUrl)
  const src = isR2
    ? r2Configured()
      ? await presignDownload(lesson.playUrl!)
      : null // R2 lesson but storage is off in this env → "not available"
    : lesson.playUrl

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
      <Reveal onMount>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {lesson.title}
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {[
              subject.name,
              formatDuration(lesson.durationSec),
              formatDate(lesson.recordedOn),
              formatFileSize(lesson.sizeBytes),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </Reveal>

      <Reveal onMount delay={0.1}>
        {src ? (
          <LessonPlayer src={src} title={lesson.title} kind={isR2 ? "video" : "embed"} />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-2xl border bg-muted text-muted-foreground">
            Video not available yet.
          </div>
        )}
      </Reveal>
    </div>
  )
}
