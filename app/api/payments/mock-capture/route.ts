import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth/guards"
import { mockMode } from "@/lib/payments/razorpay"
import { settleOrder } from "@/lib/payments/core"

// Dev-only: settle an order without a real Razorpay payment. Exists only when
// RAZORPAY_MOCK=1 and no real keys are set — inert (404) in production.
export async function POST(req: Request) {
  if (!mockMode()) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 })
  }
  await requireUser()
  const body = await req.json().catch(() => null)
  const orderId = body?.razorpay_order_id
  if (!orderId) return NextResponse.json({ ok: false }, { status: 400 })
  await settleOrder(db, orderId, `pay_mock_${Date.now()}`)
  return NextResponse.json({ ok: true })
}
