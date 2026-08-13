import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyWebhookSignature } from "@/lib/payments/razorpay"
import { settleOrder } from "@/lib/payments/core"

// Razorpay webhook — the authoritative source of truth. The browser callback
// can be lost, so access must still land from here. Verify the signature over
// the RAW body, then settle idempotently.
export async function POST(req: Request) {
  const raw = await req.text()
  const signature = req.headers.get("x-razorpay-signature") ?? ""
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ ok: false, error: "bad signature" }, { status: 400 })
  }
  const evt = JSON.parse(raw)
  if (evt?.event === "payment.captured") {
    const payment = evt?.payload?.payment?.entity
    if (payment?.order_id) {
      await settleOrder(db, payment.order_id, payment.id ?? `pay_${payment.order_id}`)
    }
  }
  // Always 200 after a valid signature so Razorpay stops retrying.
  return NextResponse.json({ ok: true })
}
