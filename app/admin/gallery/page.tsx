import { db } from "@/lib/db"
import { listExams, listGallery } from "@/lib/db/admin"
import { createGalleryAction, deleteGalleryAction } from "../actions"
import { FIELD, LABEL, BTN, CARD } from "../_styles"
import { ConfirmButton, NavSelect } from "../_ui"

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ exam?: string }>
}) {
  const { exam } = await searchParams
  const exams = await listExams(db)
  const active = exams.find((e) => e.slug === exam) ?? exams[0]
  const imgs = active ? await listGallery(db, active.id) : []

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Gallery</h1>
        <div className="w-full sm:w-56">
          <label className={LABEL}>Exam</label>
          <NavSelect param="exam" value={active?.slug} placeholder="Pick an exam" options={exams.map((e) => ({ value: e.slug, label: e.name }))} />
        </div>
      </div>

      <form action={createGalleryAction} className={`${CARD} space-y-4`}>
        <p className="font-semibold">Add an image to {active?.name}</p>
        <input type="hidden" name="examId" value={active?.id} />
        <div><label className={LABEL}>Image link *</label><input name="url" required className={FIELD} placeholder="https://…/image.jpg" /></div>
        <button type="submit" className={BTN}>Add image</button>
      </form>

      {imgs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No images for {active?.name} yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {imgs.map((img) => (
            <div key={img.id} className="overflow-hidden rounded-2xl border bg-card">
              <div className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
              </div>
              <form action={deleteGalleryAction} className="flex justify-end p-2">
                <input type="hidden" name="id" value={img.id} />
                <ConfirmButton label="Remove" message="Remove this image?" />
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
