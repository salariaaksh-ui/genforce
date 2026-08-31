import { describe, it, expect, beforeEach } from "vitest"
import { presignUpload, presignDownload, objectKey, r2Configured } from "./r2"

// Fake but well-formed R2 creds — presigning is pure crypto, hits no network.
beforeEach(() => {
  process.env.R2_ACCOUNT_ID = "acct123"
  process.env.R2_ACCESS_KEY_ID = "AKIAFAKE"
  process.env.R2_SECRET_ACCESS_KEY = "secretfake"
  process.env.R2_BUCKET = "genforce-media"
})

describe("r2 storage", () => {
  it("r2Configured reflects env presence", () => {
    expect(r2Configured()).toBe(true)
    delete process.env.R2_BUCKET
    expect(r2Configured()).toBe(false)
  })

  it("objectKey namespaces by prefix, keeps ext, randomizes name", () => {
    const k = objectKey("lessons", "Percentage Class 1.MP4")
    expect(k).toMatch(/^lessons\/[0-9a-f-]{36}\.mp4$/)
    expect(objectKey("lessons", "x.mp4")).not.toBe(objectKey("lessons", "x.mp4"))
  })

  it("presignUpload signs a PUT to the bucket+key on the R2 endpoint", async () => {
    // Virtual-hosted style: bucket is a subdomain of the account's R2 endpoint.
    const url = await presignUpload("lessons/abc.mp4", "video/mp4")
    expect(url).toContain("genforce-media.acct123.r2.cloudflarestorage.com")
    expect(url).toContain("/lessons/abc.mp4")
    expect(url).toContain("X-Amz-Signature=")
    expect(url).toContain("X-Amz-Expires=3600")
  })

  it("presignDownload signs a GET with a 6h default TTL", async () => {
    const url = await presignDownload("lessons/abc.mp4")
    expect(url).toContain("genforce-media.acct123.r2.cloudflarestorage.com")
    expect(url).toContain("/lessons/abc.mp4")
    expect(url).toContain("X-Amz-Expires=21600")
  })

  it("throws a clear error when the bucket var is missing", () => {
    // env() throws synchronously (before the promise is built), and the bucket
    // is read fresh every call (unlike creds baked into the cached client).
    delete process.env.R2_BUCKET
    expect(() => presignDownload("k")).toThrow(/R2_BUCKET/)
  })
})
