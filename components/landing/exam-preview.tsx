"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"

const EXAMS = [
  { code: "AFCAT", stream: "Air Force" },
  { code: "NDA", stream: "Tri-service" },
  { code: "CDS", stream: "Defence Services" },
  { code: "CAPF", stream: "Police Forces" },
] as const

/** Interactive product preview: tap an exam, the dashboard mock reshapes around
 *  it — a live demo of "your dashboard reshapes around your exam". Generic
 *  labels only (no fabricated data). */
export function ExamPreview() {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  const exam = EXAMS[i]

  return (
    <div className="rounded-3xl border bg-card/60 p-4 backdrop-blur-sm">
      {/* tabs */}
      <div role="tablist" aria-label="Preview an exam" className="flex flex-wrap gap-2">
        {EXAMS.map((e, idx) => {
          const active = idx === i
          return (
            <button
              key={e.code}
              role="tab"
              aria-selected={active}
              onClick={() => setI(idx)}
              className={`relative rounded-full px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="examPill"
                  className="absolute inset-0 -z-10 rounded-full bg-primary"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              {e.code}
            </button>
          )
        })}
      </div>

      {/* preview card */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="col-span-2 flex items-center gap-4 rounded-2xl bg-primary p-5 text-primary-foreground">
          <ProgressRing key={reduce ? "ring-static" : `ring-${exam.code}`} />
          {/* Keyed remount on exam change → fades in fresh (no AnimatePresence,
              which stalled against the layoutId pill in this same subtree). */}
          <motion.div
            key={`txt-${exam.code}`}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="font-semibold">Continue · {exam.code} batch</p>
            <p className="text-sm opacity-80">{exam.stream} — pick up at your next lesson</p>
          </motion.div>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xl font-bold">PDFs</p>
          <p className="mt-1 text-sm text-muted-foreground">No duplicates</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xl font-bold">Timed</p>
          <p className="mt-1 text-sm text-muted-foreground">Practice papers</p>
        </div>
      </div>
    </div>
  )
}

/** Small circular progress that draws itself on mount (and on exam change). */
function ProgressRing() {
  const reduce = useReducedMotion()
  const r = 20
  const c = 2 * Math.PI * r
  const pct = 0.66
  return (
    <svg viewBox="0 0 48 48" className="size-12 flex-none -rotate-90">
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="5" />
      <motion.circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke="var(--signal)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: reduce ? c * (1 - pct) : c }}
        animate={{ strokeDashoffset: c * (1 - pct) }}
        transition={{ duration: reduce ? 0 : 0.9, ease: "easeOut" }}
      />
    </svg>
  )
}
