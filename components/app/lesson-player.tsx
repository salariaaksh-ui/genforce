import { toEmbedUrl } from "@/lib/embed"

/**
 * Responsive 16:9 embed for a recorded class. Accepts whatever video link the
 * admin pasted (YouTube watch/short/share, Vimeo, or an already-embeddable URL)
 * and normalizes it to a playable embed via toEmbedUrl.
 */
export function LessonPlayer({ src, title }: { src: string; title: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border bg-black">
      <iframe
        src={toEmbedUrl(src)}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}
