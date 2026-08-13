import Link from "next/link"
import Image from "next/image"
import { Layers } from "lucide-react"

/** A course (batch) card: thumbnail on top, name + cycle below. Falls back to a
 *  branded gradient tile when no thumbnail is set, so partial content still looks
 *  intentional. The visible name labels the link, so the image is decorative. */
export function CourseCard({
  href,
  name,
  cycle,
  thumbnail,
}: {
  href: string
  name: string
  cycle?: string | null
  thumbnail?: string | null
}) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-video overflow-hidden bg-secondary">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-primary/25 to-secondary text-primary">
            <Layers className="size-8" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-5">
        <span className="font-semibold">{name}</span>
        <span className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {cycle && <span className="hidden sm:inline">{cycle}</span>}
          <span aria-hidden className="text-primary transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </Link>
  )
}
