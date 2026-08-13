import { describe, it, expect } from "vitest"
import { isPaid, isLive, isUnlocked } from "./gate"

const now = new Date("2026-08-13T00:00:00Z")
const future = new Date("2026-12-31T00:00:00Z")
const past = new Date("2026-01-01T00:00:00Z")

describe("gate", () => {
  it("free batch (null/0 price) is always unlocked", () => {
    expect(isPaid({ priceInr: null })).toBe(false)
    expect(isPaid({ priceInr: 0 })).toBe(false)
    expect(isUnlocked({ priceInr: null }, undefined, now)).toBe(true)
    expect(isUnlocked({ priceInr: 0 }, undefined, now)).toBe(true)
  })

  it("paid batch with no entitlement is locked", () => {
    expect(isPaid({ priceInr: 9999 })).toBe(true)
    expect(isUnlocked({ priceInr: 9999 }, undefined, now)).toBe(false)
  })

  it("paid batch with a live entitlement is unlocked", () => {
    expect(isUnlocked({ priceInr: 9999 }, { expiresAt: future }, now)).toBe(true)
  })

  it("lifetime entitlement (null expiry) unlocks", () => {
    expect(isLive({ expiresAt: null }, now)).toBe(true)
    expect(isUnlocked({ priceInr: 9999 }, { expiresAt: null }, now)).toBe(true)
  })

  it("expired entitlement locks", () => {
    expect(isLive({ expiresAt: past }, now)).toBe(false)
    expect(isUnlocked({ priceInr: 9999 }, { expiresAt: past }, now)).toBe(false)
  })
})
