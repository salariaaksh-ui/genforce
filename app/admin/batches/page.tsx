import { db } from "@/lib/db"
import { listExams, listBatches } from "@/lib/db/admin"
import { createBatchAction, updateBatchAction, deleteBatchAction } from "../actions"
import { FIELD, LABEL, BTN, CARD } from "../_styles"
import { ConfirmButton, NavSelect } from "../_ui"

export default async function AdminBatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ exam?: string }>
}) {
  const { exam } = await searchParams
  const exams = await listExams(db)
  const active = exams.find((e) => e.slug === exam) ?? exams[0]
  const batches = active ? await listBatches(db, active.id) : []

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Batches (courses)</h1>
        <div className="w-56">
          <label className={LABEL}>Exam</label>
          <NavSelect
            param="exam"
            value={active?.slug}
            placeholder="Pick an exam"
            options={exams.map((e) => ({ value: e.slug, label: e.name }))}
          />
        </div>
      </div>

      {/* Add */}
      <form action={createBatchAction} className={`${CARD} space-y-4`}>
        <p className="font-semibold">Add a batch to {active?.name}</p>
        <input type="hidden" name="examId" value={active?.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={LABEL}>Name *</label><input name="name" required className={FIELD} placeholder="Juliet Batch (AFCAT 1 2027)" /></div>
          <div><label className={LABEL}>Cycle</label><input name="cycle" className={FIELD} placeholder="AFCAT 1 2027" /></div>
          <div><label className={LABEL}>Thumbnail URL</label><input name="thumbnail" className={FIELD} placeholder="/courses/juliet.webp or https://…" /></div>
          <div><label className={LABEL}>Price (₹, blank = free)</label><input name="priceInr" type="number" min="0" className={FIELD} placeholder="2540" /></div>
          <div><label className={LABEL}>Access days (blank = lifetime)</label><input name="accessDays" type="number" min="1" className={FIELD} placeholder="86" /></div>
          <div><label className={LABEL}>Sort order</label><input name="sort" type="number" className={FIELD} placeholder="0" /></div>
          <div className="sm:col-span-2"><label className={LABEL}>Description</label><textarea name="description" rows={2} className={FIELD} /></div>
        </div>
        <button type="submit" className={BTN}>Add batch</button>
      </form>

      {/* List / edit / delete */}
      <div className="space-y-4">
        {batches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No batches yet for {active?.name}.</p>
        ) : (
          batches.map((b) => (
            <div key={b.id} className={`${CARD} space-y-4`}>
              <form action={updateBatchAction} className="space-y-4">
                <input type="hidden" name="id" value={b.id} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className={LABEL}>Name *</label><input name="name" required defaultValue={b.name} className={FIELD} /></div>
                  <div><label className={LABEL}>Cycle</label><input name="cycle" defaultValue={b.cycle ?? ""} className={FIELD} /></div>
                  <div><label className={LABEL}>Thumbnail URL</label><input name="thumbnail" defaultValue={b.thumbnail ?? ""} className={FIELD} /></div>
                  <div><label className={LABEL}>Price (₹)</label><input name="priceInr" type="number" min="0" defaultValue={b.priceInr ?? ""} className={FIELD} /></div>
                  <div><label className={LABEL}>Access days</label><input name="accessDays" type="number" min="1" defaultValue={b.accessDays ?? ""} className={FIELD} /></div>
                  <div><label className={LABEL}>Sort</label><input name="sort" type="number" defaultValue={b.sort} className={FIELD} /></div>
                  <div className="sm:col-span-2"><label className={LABEL}>Description</label><textarea name="description" rows={2} defaultValue={b.description ?? ""} className={FIELD} /></div>
                </div>
                <button type="submit" className={BTN}>Save</button>
              </form>
              <form action={deleteBatchAction} className="flex justify-end border-t pt-3">
                <input type="hidden" name="id" value={b.id} />
                <ConfirmButton message={`Delete "${b.name}" and everything inside it?`} />
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
