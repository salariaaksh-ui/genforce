import { db } from "@/lib/db"
import { listExams, listBatches, listSubjects } from "@/lib/db/admin"
import { createSubjectAction, updateSubjectAction, deleteSubjectAction } from "../actions"
import { FIELD, LABEL, BTN, CARD } from "../_styles"
import { ConfirmButton, NavSelect } from "../_ui"

export default async function AdminSubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string }>
}) {
  const { batch } = await searchParams
  const exams = await listExams(db)
  const grouped = await Promise.all(
    exams.map(async (e) => ({ exam: e, batches: await listBatches(db, e.id) }))
  )
  const options = grouped.flatMap((g) =>
    g.batches.map((b) => ({ value: b.id, label: `${g.exam.name} — ${b.name}` }))
  )
  const activeId = batch ?? options[0]?.value
  const subjects = activeId ? await listSubjects(db, activeId) : []

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Subjects</h1>
        <div className="w-full sm:w-72">
          <label className={LABEL}>Batch</label>
          <NavSelect param="batch" value={activeId} placeholder="Pick a batch" options={options} />
        </div>
      </div>

      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">Create a batch first, then add subjects to it.</p>
      ) : (
        <>
          <form action={createSubjectAction} className={`${CARD} space-y-4`}>
            <p className="font-semibold">Add a subject</p>
            <input type="hidden" name="batchId" value={activeId} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={LABEL}>Name *</label><input name="name" required className={FIELD} placeholder="Maths" /></div>
              <div><label className={LABEL}>Teacher</label><input name="teacher" className={FIELD} placeholder="Ashish Garg" /></div>
              <div><label className={LABEL}>Cover image URL</label><input name="coverImage" className={FIELD} placeholder="https://…" /></div>
              <div><label className={LABEL}>Sort order</label><input name="sort" type="number" className={FIELD} placeholder="0" /></div>
            </div>
            <button type="submit" className={BTN}>Add subject</button>
          </form>

          <div className="space-y-4">
            {subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects in this batch yet.</p>
            ) : (
              subjects.map((sub) => (
                <div key={sub.id} className={`${CARD} space-y-4`}>
                  <form action={updateSubjectAction} className="space-y-4">
                    <input type="hidden" name="id" value={sub.id} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><label className={LABEL}>Name *</label><input name="name" required defaultValue={sub.name} className={FIELD} /></div>
                      <div><label className={LABEL}>Teacher</label><input name="teacher" defaultValue={sub.teacher ?? ""} className={FIELD} /></div>
                      <div><label className={LABEL}>Cover image URL</label><input name="coverImage" defaultValue={sub.coverImage ?? ""} className={FIELD} /></div>
                      <div><label className={LABEL}>Sort</label><input name="sort" type="number" defaultValue={sub.sort} className={FIELD} /></div>
                    </div>
                    <button type="submit" className={BTN}>Save</button>
                  </form>
                  <form action={deleteSubjectAction} className="flex justify-end border-t pt-3">
                    <input type="hidden" name="id" value={sub.id} />
                    <ConfirmButton message={`Delete subject "${sub.name}" and its lessons?`} />
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
