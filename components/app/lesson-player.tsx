import { toEmbedUrl } from "@/lib/embed"

/**
 * Responsive 16:9 player for a recorded class.
 * - kind="embed": a pasted YouTube/Vimeo/Zoom link, normalized to an embed URL.
 * - kind="video": a self-hosted R2 file, delivered as a short-lived signed URL
 *   (minted server-side only after the entitlement gate), streamed natively.
 */
export function LessonPlayer({
  src,
  title,
  kind = "embed",
}: {
  src: string
  title: string
  kind?: "embed" | "video"
}) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border bg-black">
      {kind === "video" ? (
        <video
          src={src}
          title={title}
          controls
          controlsList="nodownload"
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <iframe
          src={toEmbedUrl(src)}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      )}
    </div>
  )
}
