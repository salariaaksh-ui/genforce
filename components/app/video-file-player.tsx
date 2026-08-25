/**
 * Native <video> player for a self-hosted file (Cloudflare R2), given a
 * short-lived presigned URL. Used for lessons with source "r2"; iframe embeds
 * (YouTube/Vimeo/Zoom) keep using LessonPlayer instead.
 *
 * `controlsList="nodownload"` hides the browser's download button — a mild
 * deterrent, not real DRM (the presigned-URL expiry is the actual protection).
 */
export function VideoFilePlayer({ src, title }: { src: string; title: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border bg-black">
      <video
        src={src}
        title={title}
        controls
        controlsList="nodownload"
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  )
}
