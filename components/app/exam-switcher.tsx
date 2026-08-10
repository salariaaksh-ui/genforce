"use client"

import { useRef } from "react"
import { selectExam } from "@/app/actions/exam"
import { EXAM_SLUGS, EXAM_LABEL } from "@/lib/exams"

/** Native <dialog> — gives focus trap, Escape, top-layer, and focus-return for
 *  free, so there's no manual key/focus handling to get wrong. */
export function ExamSwitcher({ currentLabel }: { currentLabel: string }) {
  const ref = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        onClick={() => ref.current?.showModal()}
        className="rounded-full border px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {currentLabel}
      </button>
      <dialog
        ref={ref}
        aria-label="Change your exam"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close()
        }}
        className="m-auto w-full max-w-sm rounded-2xl border bg-popover p-6 text-popover-foreground backdrop:bg-foreground/50"
      >
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Change your exam
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {EXAM_SLUGS.map((slug) => (
            <form key={slug} action={selectExam.bind(null, slug)}>
              <button
                type="submit"
                className="w-full rounded-xl border bg-card p-4 font-semibold transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {EXAM_LABEL[slug]}
              </button>
            </form>
          ))}
        </div>
      </dialog>
    </>
  )
}
