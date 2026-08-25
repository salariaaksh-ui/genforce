import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { r2Configured, r2Key, presignGet, presignPut } from "./r2"

const ENV = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"] as const

function setEnv() {
  process.env.R2_ACCOUNT_ID = "acct123"
  process.env.R2_ACCESS_KEY_ID = "AKIAEXAMPLE"
  process.env.R2_SECRET_ACCESS_KEY = "secretExampleKey"
  process.env.R2_BUCKET = "genforce-videos"
}
function clearEnv() {
  for (const k of ENV) delete process.env[k]
}

describe("r2Key", () => {
  it("strips a leading slash", () => {
    expect(r2Key("/lessons/a.mp4")).toBe("lessons/a.mp4")
  })
  it("keeps a plain key unchanged", () => {
    expect(r2Key("lessons/a.mp4")).toBe("lessons/a.mp4")
  })
  it("extracts the path from a full URL", () => {
    expect(
      r2Key("https://acct123.r2.cloudflarestorage.com/genforce-videos/lessons/a.mp4", "genforce-videos")
    ).toBe("lessons/a.mp4")
  })
  it("drops a leading bucket segment", () => {
    expect(r2Key("genforce-videos/lessons/a.mp4", "genforce-videos")).toBe("lessons/a.mp4")
  })
})

describe("R2 config gating", () => {
  beforeEach(clearEnv)
  afterEach(clearEnv)

  it("is disabled with no env — presign returns null", async () => {
    expect(r2Configured()).toBe(false)
    expect(await presignGet("lessons/a.mp4")).toBeNull()
    expect(await presignPut("lessons/a.mp4")).toBeNull()
  })

  it("is enabled once all four vars are set", () => {
    setEnv()
    expect(r2Configured()).toBe(true)
  })
})

describe("presign (configured)", () => {
  beforeEach(setEnv)
  afterEach(clearEnv)

  it("produces a signed GET URL with the expected structure", async () => {
    const url = await presignGet("lessons/a.mp4", 3600)
    expect(url).toBeTruthy()
    const u = new URL(url!)
    expect(u.host).toBe("acct123.r2.cloudflarestorage.com")
    expect(u.pathname).toBe("/genforce-videos/lessons/a.mp4")
    expect(u.searchParams.get("X-Amz-Expires")).toBe("3600")
    expect(u.searchParams.get("X-Amz-Signature")).toBeTruthy()
    expect(u.searchParams.get("X-Amz-Credential")).toContain("AKIAEXAMPLE/")
    expect(u.searchParams.get("X-Amz-Credential")).toContain("/auto/s3/aws4_request")
    expect(u.searchParams.get("X-Amz-Algorithm")).toBe("AWS4-HMAC-SHA256")
  })

  it("signs PUT differently from GET (method is part of the signature)", async () => {
    const get = await presignGet("lessons/a.mp4", 900)
    const put = await presignPut("lessons/a.mp4", 900)
    const gs = new URL(get!).searchParams.get("X-Amz-Signature")
    const ps = new URL(put!).searchParams.get("X-Amz-Signature")
    expect(gs).toBeTruthy()
    expect(ps).toBeTruthy()
    expect(gs).not.toBe(ps)
  })
})
