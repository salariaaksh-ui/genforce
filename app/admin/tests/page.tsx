import { db } from "@/lib/db"
import { listExams, listTests } from "@/lib/db/admin"
import { createTestAction, deleteTestAction } from "../actions"
import { FIELD, LABEL, BTN, CARD } from "../_styles"
import { ConfirmButton, NavSelect } from "../_ui"

export default async function AdminTestsPage({
  searchParams,
}: {
  searchParams: Promise<{ exam?: string }>
}) {
  const { exam } = await searchParams
  const exams = await listExams(db)
  const active = exams.find((e) => e.slug === exam) ?? exams[0]
  const forms = active ? await listTests(db, active.id) : []

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Practice tests</h1>
        <div className="w-56">
          <label className={LABEL}>Exam</label>
          <NavSelect param="exam" value={active?.slug} placeholder="Pick an exam" options={exams.map((e) => ({ value: e.slug, label: e.name }))} />
        </div>
      </div>

      <form action={createTestAction} className={`${CARD} space-y-4`}>
        <p className="font-semibold">Add a test to {active?.name}</p>
        <input type="hidden" name="examId" value={active?.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={LABEL}>Set name *</label><input name="setName" required className={FIELD} placeholder="Mock Test 1" /></div>
          <div><label className={LABEL}>Google Form link *</label><input name="formUrl" required className={FIELD} placeholder="https://forms.gle/…" /></div>
          <div><label className={LABEL}>Time limit (minutes)</label><input name="timeLimitMin" type="number" min="0" className={FIELD} placeholder="60" /></div>
          <div><label className={LABEL}>Date</label><input name="formDate" type="date" className={FIELD} /></div>
        </div>
        <button type="submit" className={BTN}>Add test</button>
      </form>

      <div className="overflow-hidden rounded-2xl border">
        {forms.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No tests for {active?.name} yet.</p>
        ) : (
          forms.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-4 border-b bg-card px-5 py-3 last:border-0">
              <a href={t.formUrl} target="_blank" rel="noopener noreferrer" className="truncate font-medium hover:underline">
                {t.setName ?? "Practice set"}
                <span className="ml-2 font-mono text-xs text-muted-foreground">{[t.timeLimitMin ? `${t.timeLimitMin} min` : null, t.formDate].filter(Boolean).join(" · ")}</span>
              </a>
              <form action={deleteTestAction}>
                <input type="hidden" name="id" value={t.id} />
                <ConfirmButton message={`Delete "${t.setName ?? "this test"}"?`} />
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
