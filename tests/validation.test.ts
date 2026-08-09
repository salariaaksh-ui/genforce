import { expect, test } from "vitest"
import { normalizePhone } from "../lib/validation"

test("accepts 10 digits with noise", () => {
  expect(normalizePhone("+91 62845 82074".slice(3))).toBe("6284582074")
  expect(normalizePhone("628-458-2074")).toBe("6284582074")
})

test("rejects wrong length", () => {
  expect(normalizePhone("12345")).toBeNull()
  expect(normalizePhone("")).toBeNull()
})
