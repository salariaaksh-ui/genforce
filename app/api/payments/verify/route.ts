import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth/guards"
import { verifyPaymentSignature } from "@/lib/payments/razorpay"
import { settleOrder } from "@/lib/payments/core"

// Razorpay checkout success callback. Verifies the signature server-side, then
// settles the order. The client is never trusted to grant access.
export async function POST(req: Request) {
  await requireUser()
  const body = await req.json().catch(() => null)
  const orderId = body?.razorpay_order_id
  const paymentId = body?.razorpay_payment_id
  const signature = body?.razorpay_signature
  if (!orderId || !paymentId) {
    return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 })
  }
  if (!verifyPaymentSignature(orderId, paymentId, signature ?? "")) {
    return NextResponse.json({ ok: false, error: "bad signature" }, { status: 400 })
  }
  await settleOrder(db, orderId, paymentId)
  return NextResponse.json({ ok: true })
}
