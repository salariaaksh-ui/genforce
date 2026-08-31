"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

function parts(msLeft: number) {
  const s = Math.floor(msLeft / 1000)
  return {
    h: Math.floor(s / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  }
}

/** Live HH:MM:SS countdown to `endsAt` (ISO). Renders nothing before hydration
 *  (avoids SSR/client clock mismatch) and once expired — on expiry it refreshes
 *  the server components so discounted prices revert to full automatically. */
export function Countdown({ endsAt }: { endsAt: string }) {
  const router = useRouter()
  const [left, setLeft] = useState<number | null>(null)

  useEffect(() => {
    const end = new Date(endsAt).getTime()
    const tick = () => {
      const ms = end - Date.now()
      setLeft(ms)
      if (ms <= 0) router.refresh()
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt, router])

  if (left == null || left <= 0) return null
  const { h, m, s } = parts(left)
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    <span
      className="font-mono font-semibold tabular-nums"
      role="timer"
      aria-label={`Offer ends in ${h} hours ${m} minutes ${s} seconds`}
    >
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  )
}
