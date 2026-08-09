"use client"

import { useEffect, useState } from "react"
import { selectExam } from "@/app/actions/exam"
import { EXAM_SLUGS, EXAM_LABEL } from "@/lib/exams"

export function ExamSwitcher({ currentLabel }: { currentLabel: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {currentLabel}
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Change your exam"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm border bg-background p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Change your exam
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-px border bg-border">
              {EXAM_SLUGS.map((slug) => (
                <form key={slug} action={selectExam.bind(null, slug)}>
                  <button
                    type="submit"
                    className="w-full bg-background p-4 font-display font-semibold transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
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
