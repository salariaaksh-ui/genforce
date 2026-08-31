import { describe, it, expect, afterEach } from "vitest"
import { discountedInr, offerActive } from "./offer"

const orig = process.env.OFFER_ENDS_AT
afterEach(() => {
  if (orig === undefined) delete process.env.OFFER_ENDS_AT
  else process.env.OFFER_ENDS_AT = orig
})

describe("discountedInr", () => {
  it("matches the poster's 10%-off figures", () => {
    expect(discountedInr(700)).toBe(630)
    expect(discountedInr(2000)).toBe(1800)
    expect(discountedInr(350)).toBe(315)
    expect(discountedInr(1500)).toBe(1350)
  })
})

describe("offerActive", () => {
  const now = new Date("2026-08-17T12:00:00Z")
  it("is false when no deadline is set", () => {
    delete process.env.OFFER_ENDS_AT
    expect(offerActive(now)).toBe(false)
  })
  it("is false for a malformed deadline", () => {
    process.env.OFFER_ENDS_AT = "not-a-date"
    expect(offerActive(now)).toBe(false)
  })
  it("is true before the deadline, false after", () => {
    process.env.OFFER_ENDS_AT = "2026-08-17T18:00:00Z"
    expect(offerActive(now)).toBe(true)
    expect(offerActive(new Date("2026-08-17T18:00:01Z"))).toBe(false)
  })
})
