import { Images } from "lucide-react"
import { requireActiveExam, listGallery } from "@/lib/db/queries"
import { resolveRef } from "@/lib/storage/r2"
import { Breadcrumbs } from "@/components/app/breadcrumbs"
import { Reveal } from "@/components/motion/reveal"
import { EmptyState } from "@/components/app/empty-state"

export const metadata = { title: "Gallery" }

export default async function GalleryPage() {
  const { examId } = await requireActiveExam()
  const rows = await listGallery(examId)
  // Sign R2-hosted images; external links pass through unchanged. Drop any ref
  // that can't resolve (R2 unconfigured) so no broken tiles render.
  const imgs = (await Promise.all(rows.map(async (img) => ({ ...img, src: await resolveRef(img.url) })))).filter(
    (img) => img.src,
  )

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Gallery" }]}
      />
      <Reveal onMount>
        <h1 className="text-3xl font-extrabold tracking-tight">Image gallery</h1>
      </Reveal>

      {imgs.length === 0 ? (
        <EmptyState
          icon={<Images className="size-5" />}
          title="No images yet"
          hint="Reference sheets and question snaps will appear here."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {imgs.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-2xl border transition-transform hover:scale-[1.02]"
            >
              {/* ponytail: plain <img> because the image host is client-provided
                  and unknown until content lands. Switch to next/image once the
                  host is fixed and added to next.config images.remotePatterns. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
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
