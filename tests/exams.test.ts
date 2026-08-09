import { expect, test } from "vitest"
import { isExamSlug, EXAM_LABEL } from "../lib/exams"

test("valid slugs accepted", () => {
  expect(isExamSlug("afcat")).toBe(true)
  expect(isExamSlug("capf")).toBe(true)
})

test("invalid slugs rejected", () => {
  expect(isExamSlug("gate")).toBe(false)
  expect(isExamSlug("")).toBe(false)
})

test("every slug has a label", () => {
  expect(EXAM_LABEL.afcat).toBe("AFCAT")
  expect(EXAM_LABEL.nda).toBe("NDA")
})
