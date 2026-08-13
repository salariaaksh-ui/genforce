import { describe, it, expect, beforeEach, afterEach } from "vitest"
import crypto from "node:crypto"
import {
  paymentsConfigured,
  mockMode,
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "./razorpay"

const ENV_KEYS = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET", "RAZORPAY_MOCK"]
let saved: Record<string, string | undefined>

beforeEach(() => {
  saved = {}
  for (const k of ENV_KEYS) {
    saved[k] = process.env[k]
    delete process.env[k]
  }
})
afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k]
    else process.env[k] = saved[k]
  }
})

describe("razorpay signatures", () => {
  it("accepts a correct payment signature and rejects a tampered one", () => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_x"
    process.env.RAZORPAY_KEY_SECRET = "secret123"
    const orderId = "order_abc"
    const paymentId = "pay_def"
    const good = crypto.createHmac("sha256", "secret123").update(`${orderId}|${paymentId}`).digest("hex")
    expect(verifyPaymentSignature(orderId, paymentId, good)).toBe(true)
    const tampered = good.slice(0, -1) + (good.at(-1) === "0" ? "1" : "0")
    expect(verifyPaymentSignature(orderId, paymentId, tampered)).toBe(false)
    expect(verifyPaymentSignature(orderId, paymentId, "short")).toBe(false)
  })

  it("verifies a webhook signature over the raw body", () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "whsec"
    const body = JSON.stringify({ event: "payment.captured" })
    const sig = crypto.createHmac("sha256", "whsec").update(body).digest("hex")
    expect(verifyWebhookSignature(body, sig)).toBe(true)
    expect(verifyWebhookSignature(body + " ", sig)).toBe(false)
  })

  it("rejects when no secret is configured", () => {
    expect(verifyPaymentSignature("o", "p", "x")).toBe(false)
    expect(verifyWebhookSignature("b", "x")).toBe(false)
  })
})

describe("razorpay mode", () => {
  it("mock mode returns a synthetic order id with no keys", async () => {
    process.env.RAZORPAY_MOCK = "1"
    expect(paymentsConfigured()).toBe(false)
    expect(mockMode()).toBe(true)
    const order = await createRazorpayOrder(9999, "receipt-7", { batchId: "b" })
    expect(order.id).toBe("order_mock_receipt-7")
  })

  it("is configured when both keys are present", () => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_x"
    process.env.RAZORPAY_KEY_SECRET = "secret123"
    expect(paymentsConfigured()).toBe(true)
    expect(mockMode()).toBe(false)
  })

  it("mock-mode payment signature auto-verifies", () => {
    process.env.RAZORPAY_MOCK = "1"
    expect(verifyPaymentSignature("o", "p", "anything")).toBe(true)
  })
})
