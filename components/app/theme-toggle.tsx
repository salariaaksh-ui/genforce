"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Moon, Sun } from "lucide-react"

/** Manual light/dark switch. Toggles `.dark` on <html> and persists the choice;
 *  the no-flash script in the root layout applies it before paint on load. */
export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  function toggle() {
    const el = document.documentElement
    const next = !el.classList.contains("dark")
    el.classList.toggle("dark", next)
    try {
      localStorage.setItem("theme", next ? "dark" : "light")
    } catch {}
    setDark(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid size-8 place-items-center overflow-hidden rounded-full border hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? "sun" : "moon"}
          initial={reduce ? false : { y: 12, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={reduce ? undefined : { y: -12, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.18 }}
          className="grid place-items-center"
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
