import { notFound } from "next/navigation"
import { requireActiveExam, getLesson, assertBatchUnlocked } from "@/lib/db/queries"
import { Breadcrumbs } from "@/components/app/breadcrumbs"
import { LessonPlayer } from "@/components/app/lesson-player"
import { VideoFilePlayer } from "@/components/app/video-file-player"
import { presignGet } from "@/lib/r2"
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

  // Self-hosted (R2) videos store an object key; presign a short-lived streaming
  // URL server-side. Everything else is an embeddable link handled by an iframe.
  const r2Src =
    lesson.source === "r2" && lesson.playUrl ? await presignGet(lesson.playUrl) : null

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
        {lesson.source === "r2" ? (
          r2Src ? (
            <VideoFilePlayer src={r2Src} title={lesson.title} />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl border bg-muted text-muted-foreground">
              Video not available yet.
            </div>
          )
        ) : lesson.playUrl ? (
          <LessonPlayer src={lesson.playUrl} title={lesson.title} />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-2xl border bg-muted text-muted-foreground">
            Video not available yet.
          </div>
        )}
      </Reveal>
    </div>
  )
}
