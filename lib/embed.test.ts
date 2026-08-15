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
  it("passes through already-embeddable and unknown URLs", () => {
    expect(toEmbedUrl("https://www.youtube.com/embed/abc123")).toBe("https://www.youtube.com/embed/abc123")
    expect(toEmbedUrl("https://player.vimeo.com/video/76979871")).toBe("https://player.vimeo.com/video/76979871")
    expect(toEmbedUrl("https://zoom.us/rec/share/xyz")).toBe("https://zoom.us/rec/share/xyz")
    expect(toEmbedUrl("not a url")).toBe("not a url")
  })
})
