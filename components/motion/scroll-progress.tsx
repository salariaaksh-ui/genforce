"use client"

import { motion, useScroll, useReducedMotion } from "motion/react"

/** Thin reading-progress bar pinned to the top of the page. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <motion.div
      aria-hidden
      style={{ scaleX: scrollYProgress }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-primary"
    />
  )
}
