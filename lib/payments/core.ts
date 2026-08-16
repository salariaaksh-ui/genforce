import { and, eq } from "drizzle-orm"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import * as schema from "@/lib/db/schema"
import { batches, entitlements, orders } from "@/lib/db/schema"
import { isPaid, isLive } from "./gate"
import { createRazorpayOrder, publicKeyId } from "./razorpay"

// Payment core, db-injected (same pattern as importContent) so the whole flow
// runs under a fresh PGlite in tests. Routes/actions pass the app db.
type Db = PostgresJsDatabase<typeof schema>

/** Insert or extend the caller's entitlement for a batch. Lifetime (null
 *  expiry) always wins; otherwise keep the later expiry. Idempotent per
 *  (userId, batchId). */
export async function grantEntitlement(
  db: Db,
  opts: {
    userId: string
    batchId: string
    orderId?: string | null
    source?: "purchase" | "grant"
    accessDays?: number | null
  }
) {
  const { userId, batchId, orderId = null, source = "purchase", accessDays = null } = opts
  const expiresAt = accessDays ? new Date(Date.now() + accessDays * 864e5) : null

  const existing = await db.query.entitlements.findFirst({
    where: and(eq(entitlements.userId, userId), eq(entitlements.batchId, batchId)),
  })
  if (!existing) {
    await db.insert(entitlements).values({ userId, batchId, orderId, source, expiresAt })
    return
  }
  const merged =
    expiresAt == null || existing.expiresAt == null
      ? null
      : expiresAt > existing.expiresAt
        ? expiresAt
        : existing.expiresAt
  await db
    .update(entitlements)
    .set({ expiresAt: merged, orderId: orderId ?? existing.orderId })
    .where(eq(entitlements.id, existing.id))
}

/** Mark an order paid and grant its entitlement. Idempotent: a second call for
 *  an already-paid order is a no-op (webhook + callback can both arrive). */
export async function settleOrder(db: Db, razorpayOrderId: string, paymentId: string) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.razorpayOrderId, razorpayOrderId),
  })
  if (!order || order.status === "paid") return
  await db
    .update(orders)
    .set({ status: "paid", razorpayPaymentId: paymentId, paidAt: new Date() })
    .where(eq(orders.id, order.id))
  const batch = await db.query.batches.findFirst({ where: eq(batches.id, order.batchId) })
  await grantEntitlement(db, {
    userId: order.userId,
    batchId: order.batchId,
    orderId: order.id,
    source: "purchase",
    accessDays: batch?.accessDays ?? null,
  })
}

/** Expected, caller-actionable checkout failures. The `code` lets the server
 *  action map to a safe user-facing message / navigation without string-matching
 *  (thrown Error messages are redacted in production builds). */
export type OrderErrorCode = "not_found" | "free" | "already_enrolled"
export class OrderError extends Error {
  readonly code: OrderErrorCode
  constructor(message: string, code: OrderErrorCode) {
    super(message)
    this.code = code
  }
}

/** Create a Razorpay (or mock) order for a paid, unowned course scoped to the
 *  user's active exam. Snapshots the price server-side. */
export async function createOrder(
  db: Db,
  args: { userId: string; examId: string; batchId: string }
): Promise<{ orderId: string; amountInr: number; keyId: string | null }> {
  const { userId, examId, batchId } = args
  const batch = await db.query.batches.findFirst({
    where: and(eq(batches.id, batchId), eq(batches.examId, examId)),
  })
  if (!batch) throw new OrderError("course not found", "not_found")
  if (!isPaid(batch)) throw new OrderError("course is free", "free")

  const ent = await db.query.entitlements.findFirst({
    where: and(eq(entitlements.userId, userId), eq(entitlements.batchId, batchId)),
  })
  if (isLive(ent)) throw new OrderError("already enrolled", "already_enrolled")

  const amountInr = batch.priceInr! // isPaid guarantees non-null > 0
  const receipt = `gf_${batchId.slice(0, 8)}_${userId.slice(0, 8)}_${Date.now()}`
  const rz = await createRazorpayOrder(amountInr, receipt, { batchId, userId })
  await db
    .insert(orders)
    .values({ userId, batchId, amountInr, razorpayOrderId: rz.id })
  return { orderId: rz.id, amountInr, keyId: publicKeyId() }
}
