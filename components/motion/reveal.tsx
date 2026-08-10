"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

/**
 * Fade/rise wrapper. Default plays when scrolled into view (once); `onMount`
 * plays immediately (for above-the-fold hero content). Fully skipped when the
 * user prefers reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  y = 14,
  onMount = false,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  onMount?: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>

  const anim = { opacity: 1, y: 0 }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...(onMount
        ? { animate: anim }
        : { whileInView: anim, viewport: { once: true, margin: "-80px" } })}
      transition={{ duration: 0.5, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}
