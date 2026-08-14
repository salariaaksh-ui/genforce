import crypto from "node:crypto"

// Razorpay wiring with no SDK dependency — the Orders API is one authenticated
// POST and signatures are plain HMAC-SHA256. Env is read at call time (not at
// import) so tests and the dev mock can toggle it per case.

const RZP_ORDERS_URL = "https://api.razorpay.com/v1/orders"

function keyId() {
  return process.env.RAZORPAY_KEY_ID ?? ""
}
function keySecret() {
  return process.env.RAZORPAY_KEY_SECRET ?? ""
}
function webhookSecret() {
  return process.env.RAZORPAY_WEBHOOK_SECRET ?? ""
}

/** Real Razorpay keys present — live/test mode against the API. */
export function paymentsConfigured(): boolean {
  return Boolean(keyId() && keySecret())
}

/** No real keys, but RAZORPAY_MOCK=1 — offline dev flow, never in production.
 *  The NODE_ENV guard is a hard kill-switch: even a stray RAZORPAY_MOCK=1 left
 *  in a production env can never open the free-entitlement mock-capture path. */
export function mockMode(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    !paymentsConfigured() &&
    process.env.RAZORPAY_MOCK === "1"
  )
}

/** The publishable key id for the client checkout (null in mock mode). */
export function publicKeyId(): string | null {
  return paymentsConfigured() ? keyId() : null
}

function hmacHex(secret: string, payload: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

/** Constant-time hex-string compare that tolerates length mismatch. */
function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8")
  const bb = Buffer.from(b, "utf8")
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

export type RazorpayOrder = { id: string }

/**
 * Create an order. In mock mode returns a synthetic id with no network call.
 * `amountInr` is rupees; Razorpay wants paise.
 */
export async function createRazorpayOrder(
  amountInr: number,
  receipt: string,
  notes: Record<string, string>
): Promise<RazorpayOrder> {
  if (mockMode()) return { id: `order_mock_${receipt}` }
  if (!paymentsConfigured()) throw new Error("Razorpay is not configured")

  const auth = Buffer.from(`${keyId()}:${keySecret()}`).toString("base64")
  const res = await fetch(RZP_ORDERS_URL, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountInr * 100, currency: "INR", receipt, notes }),
  })
  if (!res.ok) throw new Error(`Razorpay order failed: ${res.status} ${await res.text()}`)
  return (await res.json()) as RazorpayOrder
}

/** Checkout callback signature: HMAC(order_id|payment_id, key_secret). */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (mockMode()) return true
  if (!keySecret()) return false
  return safeEqualHex(hmacHex(keySecret(), `${orderId}|${paymentId}`), signature)
}

/** Webhook signature: HMAC(rawBody, webhook_secret) from X-Razorpay-Signature. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!webhookSecret()) return false
  return safeEqualHex(hmacHex(webhookSecret(), rawBody), signature)
}
