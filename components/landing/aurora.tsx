"use client"

import { motion, useReducedMotion } from "motion/react"

/** Ambient drifting glow behind the hero. Transform-only (composited), very
 *  low opacity. Reduced motion → the same glow, held still. */
export function Aurora() {
  const reduce = useReducedMotion()
  const base = "pointer-events-none absolute rounded-full blur-3xl"
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className={`${base} left-[-8%] top-[-25%] size-[460px] bg-primary opacity-25`}
        initial={{ x: "-15%", y: "-25%" }}
        animate={reduce ? undefined : { x: ["-15%", "5%", "-15%"], y: ["-25%", "-5%", "-25%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={`${base} right-[-8%] top-[5%] size-[400px] opacity-20`}
        style={{ background: "var(--signal)" }}
        initial={{ x: "15%", y: "0%" }}
        animate={reduce ? undefined : { x: ["15%", "2%", "15%"], y: ["0%", "18%", "0%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}
