"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCourseOrder } from "@/lib/payments/actions"

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Razorpay?: new (options: any) => { open: () => void; on: (e: string, cb: () => void) => void }
  }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js"

function loadCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${CHECKOUT_SRC}"]`)) return resolve(true)
    const s = document.createElement("script")
    s.src = CHECKOUT_SRC
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

/** Pay button. Creates the order server-side, then either opens Razorpay's
 *  hosted checkout (real keys) or hits the dev mock-capture endpoint (no keys).
 *  Access is only ever granted by the server after verify/webhook. */
export function CheckoutButton({
  batchId,
  courseName,
  studentName,
  studentEmail,
}: {
  batchId: string
  courseName: string
  studentName: string | null
  studentEmail: string | null
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function done() {
    router.push(`/batches/${batchId}`)
    router.refresh()
  }

  async function pay() {
    setBusy(true)
    setError(null)
    try {
      const res = await createCourseOrder(batchId)
      if (!res.ok) {
        // Free or already-owned: nothing to pay — just open the course.
        if (res.code === "free" || res.code === "already_enrolled") return done()
        setError(res.message)
        setBusy(false)
        return
      }
      const { orderId, amountInr, keyId } = res

      // No real key = mock/offline mode: settle directly via the dev endpoint.
      if (!keyId) {
        const r = await fetch("/api/payments/mock-capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ razorpay_order_id: orderId }),
        })
        if (!r.ok) {
          setError("Could not complete the demo payment.")
          setBusy(false)
          return
        }
        done()
        return
      }

      const ok = await loadCheckoutScript()
      if (!ok || !window.Razorpay) {
        setError("Could not load the payment gateway. Check your connection and try again.")
        setBusy(false)
        return
      }

      const rzp = new window.Razorpay({
        key: keyId,
        order_id: orderId,
        amount: amountInr * 100,
        currency: "INR",
        name: "Genforce",
        description: courseName,
        prefill: { name: studentName ?? undefined, email: studentEmail ?? undefined },
        handler: async (resp: any) => {
          const v = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resp),
          })
          if (v.ok) done()
          else
            setError(
              "We couldn't confirm the payment. If money was deducted it will unlock shortly — check back or contact support."
            )
        },
        modal: { ondismiss: () => setBusy(false) },
      })
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.")
        setBusy(false)
      })
      rzp.open()
    } catch {
      // Never surface a raw exception message: a thrown server-action error is
      // redacted to an opaque digest string in production, and other throws
      // here (transport, gateway init) aren't user-meaningful either.
      setError("Something went wrong starting the payment. Please try again.")
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={pay}
        disabled={busy}
        className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
      >
        {busy ? "Processing…" : "Pay securely"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
