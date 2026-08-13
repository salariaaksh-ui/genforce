import Link from "next/link"
import { notFound } from "next/navigation"
import { BookOpen, Lock } from "lucide-react"
import {
  requireActiveExam,
  getBatch,
  listSubjects,
  getEntitlement,
} from "@/lib/db/queries"
import { isUnlocked } from "@/lib/payments/gate"
import { formatInr } from "@/lib/format"
import { Breadcrumbs } from "@/components/app/breadcrumbs"
import { Reveal } from "@/components/motion/reveal"
import { EmptyState } from "@/components/app/empty-state"
import { SubjectCard } from "@/components/app/subject-card"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ batchId: string }>
}) {
  const { batchId } = await params
  const { examId } = await requireActiveExam()
  const batch = await getBatch(batchId, examId)
  return { title: batch?.name ?? "Batch" }
}

export default async function BatchPage({
  params,
}: {
  params: Promise<{ batchId: string }>
}) {
  const { batchId } = await params
  const { user, examId } = await requireActiveExam()
  const batch = await getBatch(batchId, examId)
  if (!batch) notFound()
  const unlocked = isUnlocked(batch, await getEntitlement(user.id, batch.id))
  const subjectList = unlocked ? await listSubjects(batch.id) : []

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: batch.name }]}
      />
      <Reveal onMount>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{batch.name}</h1>
          {batch.cycle && (
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {batch.cycle}
            </p>
          )}
        </div>
      </Reveal>

      {!unlocked ? (
        <Reveal>
          <div className="rounded-2xl border bg-card p-8 text-center sm:p-12">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary">
              <Lock className="size-5" aria-hidden />
            </span>
            <h2 className="mt-5 text-xl font-bold tracking-tight">This course is locked</h2>
            <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
              Unlock {batch.name} to watch every class and download its materials.
            </p>
            {batch.priceInr != null && (
              <p className="mt-4 font-display text-3xl font-extrabold">
                {formatInr(batch.priceInr)}
              </p>
            )}
            <Link
              href={`/checkout/${batch.id}`}
              className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Unlock this course
            </Link>
          </div>
        </Reveal>
      ) : subjectList.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-5" />}
          title="No subjects yet"
          hint="Subjects appear here once they're added to this batch."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjectList.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.05}>
              <SubjectCard
                href={`/subjects/${s.id}`}
                name={s.name}
                teacher={s.teacher}
                coverImage={s.coverImage}
              />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}
