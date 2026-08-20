import { describe, it, expect } from "vitest"
import { toEmbedUrl } from "./embed"

describe("toEmbedUrl", () => {
  it("normalizes YouTube watch / short / youtu.be to /embed/", () => {
    expect(toEmbedUrl("https://www.youtube.com/watch?v=abc123")).toBe("https://www.youtube.com/embed/abc123")
    expect(toEmbedUrl("https://youtu.be/abc123")).toBe("https://www.youtube.com/embed/abc123")
    expect(toEmbedUrl("https://www.youtube.com/shorts/abc123")).toBe("https://www.youtube.com/embed/abc123")
  })
  it("normalizes vimeo.com/ID to the player URL", () => {
    expect(toEmbedUrl("https://vimeo.com/76979871")).toBe("https://player.vimeo.com/video/76979871")
  })
  it("normalizes Bunny Stream play/embed links to the embed URL", () => {
    expect(toEmbedUrl("https://iframe.mediadelivery.net/play/12345/dead-beef")).toBe(
      "https://iframe.mediadelivery.net/embed/12345/dead-beef"
    )
    expect(toEmbedUrl("https://iframe.mediadelivery.net/embed/12345/dead-beef")).toBe(
      "https://iframe.mediadelivery.net/embed/12345/dead-beef"
    )
  })
  it("preserves Bunny query params (autoplay / token auth)", () => {
    expect(
      toEmbedUrl("https://iframe.mediadelivery.net/play/12345/dead-beef?token=abc&expires=999&autoplay=false")
    ).toBe("https://iframe.mediadelivery.net/embed/12345/dead-beef?token=abc&expires=999&autoplay=false")
  })
  it("passes through already-embeddable and unknown URLs", () => {
    expect(toEmbedUrl("https://www.youtube.com/embed/abc123")).toBe("https://www.youtube.com/embed/abc123")
    expect(toEmbedUrl("https://player.vimeo.com/video/76979871")).toBe("https://player.vimeo.com/video/76979871")
    expect(toEmbedUrl("https://zoom.us/rec/share/xyz")).toBe("https://zoom.us/rec/share/xyz")
    // A Bunny direct-CDN pull URL has no library id to embed with — leave it be.
    expect(toEmbedUrl("https://vz-abc.b-cdn.net/dead-beef/playlist.m3u8")).toBe(
      "https://vz-abc.b-cdn.net/dead-beef/playlist.m3u8"
    )
    expect(toEmbedUrl("not a url")).toBe("not a url")
  })
})
