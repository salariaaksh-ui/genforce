/** Normalize a pasted video link to an embeddable player URL, so the admin can
 *  paste whatever YouTube/Vimeo gives them (watch link, short link, share link)
 *  and the lesson still plays. Unknown hosts (Zoom shares, already-embed URLs)
 *  pass through unchanged. */
export function toEmbedUrl(url: string): string {
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return url
  }
  const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "")

  // YouTube → https://www.youtube.com/embed/<id>
  if (host === "youtu.be") {
    const id = u.pathname.slice(1)
    return id ? `https://www.youtube.com/embed/${id}` : url
  }
  if (host === "youtube.com") {
    if (u.pathname === "/watch") {
      const id = u.searchParams.get("v")
      return id ? `https://www.youtube.com/embed/${id}` : url
    }
    if (u.pathname.startsWith("/embed/")) return url
    if (u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.split("/")[2]
      return id ? `https://www.youtube.com/embed/${id}` : url
    }
  }

  // Vimeo → https://player.vimeo.com/video/<id>
  if (host === "vimeo.com") {
    const id = u.pathname.split("/").filter(Boolean)[0]
    return /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : url
  }

  return url
}
