import { describe, it, expect, afterEach } from "vitest"
import { isAdminEmail } from "./admin"

afterEach(() => {
  delete process.env.ADMIN_EMAILS
})

describe("isAdminEmail", () => {
  it("allows listed emails, case-insensitive, trimmed", () => {
    process.env.ADMIN_EMAILS = " Owner@x.com , staff@y.com "
    expect(isAdminEmail("owner@x.com")).toBe(true)
    expect(isAdminEmail("STAFF@Y.COM")).toBe(true)
  })

  it("denies non-listed, null, and when unset", () => {
    process.env.ADMIN_EMAILS = "owner@x.com"
    expect(isAdminEmail("nope@x.com")).toBe(false)
    expect(isAdminEmail(null)).toBe(false)
    expect(isAdminEmail(undefined)).toBe(false)
    delete process.env.ADMIN_EMAILS
    expect(isAdminEmail("owner@x.com")).toBe(false) // no admins if unset
  })
})
