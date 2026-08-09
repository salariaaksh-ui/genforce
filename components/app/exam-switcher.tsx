"use client"

import { useState } from "react"
import { selectExam } from "@/app/actions/exam"
import { EXAM_SLUGS, EXAM_LABEL } from "@/lib/exams"

export function ExamSwitcher({ currentLabel }: { currentLabel: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border px-3 py-1 text-sm font-medium hover:bg-accent"
      >
        {currentLabel}
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Change your exam"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-80 rounded-lg bg-background p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-semibold">Change your exam</h2>
            <div className="grid grid-cols-2 gap-3">
              {EXAM_SLUGS.map((slug) => (
                <form key={slug} action={selectExam.bind(null, slug)}>
                  <button
                    type="submit"
                    className="w-full rounded-md border p-3 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {EXAM_LABEL[slug]}
                  </button>
                </form>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
