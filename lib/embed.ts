/** Normalize a pasted video link to an embeddable player URL, so the admin can
 *  paste whatever Bunny Stream / YouTube / Vimeo gives them (embed, share, watch
 *  or short link) and the lesson still plays. Unknown hosts (Zoom shares,
 *  already-embed URLs) pass through unchanged. */
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

  // Bunny Stream → https://iframe.mediadelivery.net/embed/<libraryId>/<videoId>
  // The shareable "play" link and the embed link both carry the library id and
  // video GUID in the path; normalize both to the embed form. The query string
  // is preserved so autoplay flags and (for token-authenticated libraries) the
  // `?token=…&expires=…` signature the admin pastes keep working.
  if (host === "iframe.mediadelivery.net" || host === "mediadelivery.net") {
    const [kind, libraryId, videoId] = u.pathname.split("/").filter(Boolean)
    if ((kind === "play" || kind === "embed") && libraryId && videoId) {
      return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}${u.search}`
    }
  }

  return url
}
