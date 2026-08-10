/**
 * Responsive 16:9 embed for a recorded class. playUrl is expected to be an
 * embeddable source URL (Vimeo player URL or a Zoom recording share URL) —
 * stored per lesson by whoever loads content.
 *
 * ponytail: iframes playUrl as-is. If a source needs URL rewriting to embed
 * (e.g. vimeo.com/ID → player.vimeo.com/video/ID), add a per-source transform
 * keyed on lesson.source when that content actually lands.
 */
export function LessonPlayer({ src, title }: { src: string; title: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border bg-black">
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}
