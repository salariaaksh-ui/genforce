import { requireActiveExam, listGallery } from "@/lib/db/queries"
import { Breadcrumbs } from "@/components/app/breadcrumbs"

export const metadata = { title: "Gallery" }

export default async function GalleryPage() {
  const { examId } = await requireActiveExam()
  const imgs = await listGallery(examId)

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Gallery" }]}
      />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Image gallery</h1>

      {imgs.length === 0 ? (
        <p className="text-muted-foreground">No images yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {imgs.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-sm border"
            >
              {/* ponytail: plain <img> because the image host is client-provided
                  and unknown until content lands. Switch to next/image once the
                  host is fixed and added to next.config images.remotePatterns. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
