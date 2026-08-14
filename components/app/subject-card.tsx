import Link from "next/link"
import Image from "next/image"
import { BookOpen } from "lucide-react"

/** A subject card for the "Choose your subject" grid: cover image (or a branded
 *  fallback), an AVAILABLE pill, name and teacher. The visible name labels the
 *  link, so the cover image is decorative. */
export function SubjectCard({
  href,
  name,
  teacher,
  coverImage,
}: {
  href: string
  name: string
  teacher?: string | null
  coverImage?: string | null
}) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-video overflow-hidden bg-secondary">
        {coverImage ? (
          <Image
            src={coverImage}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-primary/25 to-secondary text-primary">
            <BookOpen className="size-8" aria-hidden />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-emerald-700 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-white">
          Available
        </span>
      </div>
      <div className="p-5">
        <p className="font-semibold">{name}</p>
        {teacher && <p className="mt-1 text-sm text-muted-foreground">with {teacher}</p>}
        <span className="mt-4 block font-mono text-xs uppercase tracking-widest text-primary">
          View lessons →
        </span>
      </div>
    </Link>
  )
}
