import { expect, test } from "vitest"
import { needsOnboarding } from "../lib/auth/guards"

test("null active exam needs onboarding", () => {
  expect(needsOnboarding({ activeExamId: null })).toBe(true)
})

test("set active exam does not", () => {
  expect(needsOnboarding({ activeExamId: "abc" })).toBe(false)
})
