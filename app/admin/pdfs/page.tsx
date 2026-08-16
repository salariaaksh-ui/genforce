import { db } from "@/lib/db"
import { listExams, listPdfs } from "@/lib/db/admin"
import { createPdfAction, deletePdfAction } from "../actions"
import { FIELD, LABEL, BTN, CARD } from "../_styles"
import { ConfirmButton, NavSelect } from "../_ui"

export default async function AdminPdfsPage({
  searchParams,
}: {
  searchParams: Promise<{ exam?: string }>
}) {
  const { exam } = await searchParams
  const exams = await listExams(db)
  const active = exams.find((e) => e.slug === exam) ?? exams[0]
  const files = active ? await listPdfs(db, active.id) : []

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">PDFs</h1>
        <div className="w-full sm:w-56">
          <label className={LABEL}>Exam</label>
          <NavSelect param="exam" value={active?.slug} placeholder="Pick an exam" options={exams.map((e) => ({ value: e.slug, label: e.name }))} />
        </div>
      </div>

      <form action={createPdfAction} className={`${CARD} space-y-4`}>
        <p className="font-semibold">Add a PDF to {active?.name}</p>
        <input type="hidden" name="examId" value={active?.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={LABEL}>Title *</label><input name="filename" required className={FIELD} placeholder="Physics formula sheet" /></div>
          <div><label className={LABEL}>PDF link *</label><input name="url" required className={FIELD} placeholder="https://…/file.pdf" /></div>
        </div>
        <button type="submit" className={BTN}>Add PDF</button>
      </form>

      <div className="overflow-hidden rounded-2xl border">
        {files.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No PDFs for {active?.name} yet.</p>
        ) : (
          files.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-4 border-b bg-card px-5 py-3 last:border-0">
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate font-medium hover:underline focus-visible:outline-none focus-visible:underline">{f.filename}</a>
              <form action={deletePdfAction}>
                <input type="hidden" name="id" value={f.id} />
                <ConfirmButton message={`Delete "${f.filename}"?`} />
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
