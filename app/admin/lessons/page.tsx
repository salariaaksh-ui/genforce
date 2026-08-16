import { db } from "@/lib/db"
import { listExams, listBatches, listSubjects, listLessons } from "@/lib/db/admin"
import { createLessonAction, updateLessonAction, deleteLessonAction } from "../actions"
import { FIELD, LABEL, BTN, CARD } from "../_styles"
import { ConfirmButton, NavSelect } from "../_ui"

const SOURCES = ["youtube", "vimeo", "zoom"]
const MB = 1024 * 1024

function SourceSelect({ value }: { value?: string }) {
  return (
    <select name="source" defaultValue={value ?? "youtube"} className={FIELD}>
      {SOURCES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}

export default async function AdminLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>
}) {
  const { subject } = await searchParams
  const exams = await listExams(db)
  // Flatten exam → batch → subject into one picker list.
  const options: { value: string; label: string }[] = []
  for (const e of exams) {
    for (const b of await listBatches(db, e.id)) {
      for (const sub of await listSubjects(db, b.id)) {
        options.push({ value: sub.id, label: `${e.name} — ${b.name} — ${sub.name}` })
      }
    }
  }
  const activeId = subject ?? options[0]?.value
  const lessons = activeId ? await listLessons(db, activeId) : []

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Lessons</h1>
        <div className="w-full sm:w-80">
          <label className={LABEL}>Subject</label>
          <NavSelect param="subject" value={activeId} placeholder="Pick a subject" options={options} />
        </div>
      </div>

      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">Create a batch and a subject first, then add lessons.</p>
      ) : (
        <>
          <form action={createLessonAction} className={`${CARD} space-y-4`}>
            <p className="font-semibold">Add a lesson (it&apos;s numbered automatically)</p>
            <input type="hidden" name="subjectId" value={activeId} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className={LABEL}>Title *</label><input name="title" required className={FIELD} placeholder="Percentage Class 1" /></div>
              <div className="sm:col-span-2"><label className={LABEL}>Video link *</label><input name="playUrl" required className={FIELD} placeholder="https://youtu.be/…  (YouTube unlisted, Vimeo, or Zoom)" /></div>
              <div><label className={LABEL}>Source</label><SourceSelect /></div>
              <div><label className={LABEL}>Recorded on</label><input name="recordedOn" type="date" className={FIELD} /></div>
              <div><label className={LABEL}>Duration (minutes)</label><input name="durationMin" type="number" min="0" className={FIELD} placeholder="81" /></div>
              <div><label className={LABEL}>Size (MB)</label><input name="sizeMb" type="number" min="0" className={FIELD} placeholder="321" /></div>
            </div>
            <button type="submit" className={BTN}>Add lesson</button>
          </form>

          <div className="space-y-4">
            {lessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lessons in this subject yet.</p>
            ) : (
              lessons.map((l) => (
                <div key={l.id} className={`${CARD} space-y-4`}>
                  <form action={updateLessonAction} className="space-y-4">
                    <input type="hidden" name="id" value={l.id} />
                    <div className="flex items-center gap-3">
                      <span className="grid size-7 flex-none place-items-center rounded-full bg-secondary font-mono text-xs">{l.idx}</span>
                      <div className="flex-1"><label className={LABEL}>Title *</label><input name="title" required defaultValue={l.title} className={FIELD} /></div>
                    </div>
                    <div><label className={LABEL}>Video link *</label><input name="playUrl" required defaultValue={l.playUrl ?? ""} className={FIELD} /></div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div><label className={LABEL}>Source</label><SourceSelect value={l.source} /></div>
                      <div><label className={LABEL}>Recorded on</label><input name="recordedOn" type="date" defaultValue={l.recordedOn ?? ""} className={FIELD} /></div>
                      <div><label className={LABEL}>Duration (min)</label><input name="durationMin" type="number" min="0" defaultValue={l.durationSec ? Math.round(l.durationSec / 60) : ""} className={FIELD} /></div>
                      <div><label className={LABEL}>Size (MB)</label><input name="sizeMb" type="number" min="0" defaultValue={l.sizeBytes ? Math.round(l.sizeBytes / MB) : ""} className={FIELD} /></div>
                    </div>
                    <button type="submit" className={BTN}>Save</button>
                  </form>
                  <form action={deleteLessonAction} className="flex justify-end border-t pt-3">
                    <input type="hidden" name="id" value={l.id} />
                    <ConfirmButton message={`Delete lesson "${l.title}"?`} />
                  </form>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
