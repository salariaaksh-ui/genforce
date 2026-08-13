import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { and, eq } from "drizzle-orm"
import { freshTestDb, type TestDb } from "@/lib/db/testdb"
import * as schema from "@/lib/db/schema"
import { createOrder, settleOrder, grantEntitlement } from "./core"
import { isUnlocked } from "./gate"

async function seed(db: TestDb) {
  const [exam] = await db.insert(schema.exams).values({ slug: "afcat", name: "AFCAT" }).returning()
  const [user] = await db.insert(schema.users).values({ email: "s@t.u" }).returning()
  const [paid] = await db
    .insert(schema.batches)
    .values({ examId: exam.id, name: "PRO", priceInr: 9999, accessDays: 180 })
    .returning()
  const [free] = await db
    .insert(schema.batches)
    .values({ examId: exam.id, name: "FREE" })
    .returning()
  return { exam, user, paid, free }
}

async function entFor(db: TestDb, userId: string, batchId: string) {
  return db.query.entitlements.findFirst({
    where: and(eq(schema.entitlements.userId, userId), eq(schema.entitlements.batchId, batchId)),
  })
}

describe("payment flow (mock mode)", () => {
  let saved: string | undefined
  beforeEach(() => {
    saved = process.env.RAZORPAY_MOCK
    process.env.RAZORPAY_MOCK = "1"
    delete process.env.RAZORPAY_KEY_ID
    delete process.env.RAZORPAY_KEY_SECRET
  })
  afterEach(() => {
    if (saved === undefined) delete process.env.RAZORPAY_MOCK
    else process.env.RAZORPAY_MOCK = saved
  })

  it("create order → settle → entitlement unlocks the batch", async () => {
    const db = await freshTestDb()
    const { user, paid } = await seed(db)

    // Locked before purchase.
    expect(isUnlocked(paid, await entFor(db, user.id, paid.id))).toBe(false)

    const { orderId, amountInr } = await createOrder(db, {
      userId: user.id,
      examId: paid.examId,
      batchId: paid.id,
    })
    expect(amountInr).toBe(9999)

    await settleOrder(db, orderId, "pay_1")

    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.razorpayOrderId, orderId),
    })
    expect(order?.status).toBe("paid")

    const ent = await entFor(db, user.id, paid.id)
    expect(ent).toBeTruthy()
    expect(ent!.expiresAt).toBeInstanceOf(Date) // 180-day access
    expect(isUnlocked(paid, ent)).toBe(true)
  })

  it("webhook idempotency: settling twice keeps one entitlement", async () => {
    const db = await freshTestDb()
    const { user, paid } = await seed(db)
    const { orderId } = await createOrder(db, { userId: user.id, examId: paid.examId, batchId: paid.id })
    await settleOrder(db, orderId, "pay_1")
    await settleOrder(db, orderId, "pay_1") // duplicate delivery
    const rows = await db.query.entitlements.findMany({
      where: eq(schema.entitlements.batchId, paid.id),
    })
    expect(rows).toHaveLength(1)
  })

  it("rejects buying a free course or an already-owned one", async () => {
    const db = await freshTestDb()
    const { user, free, paid } = await seed(db)
    await expect(
      createOrder(db, { userId: user.id, examId: free.examId, batchId: free.id })
    ).rejects.toThrow(/free/)

    await grantEntitlement(db, { userId: user.id, batchId: paid.id })
    await expect(
      createOrder(db, { userId: user.id, examId: paid.examId, batchId: paid.id })
    ).rejects.toThrow(/already enrolled/)
  })

  it("re-purchase extends a dated entitlement", async () => {
    const db = await freshTestDb()
    const { user, paid } = await seed(db)
    await grantEntitlement(db, { userId: user.id, batchId: paid.id, accessDays: 1 })
    const before = (await entFor(db, user.id, paid.id))!.expiresAt!.getTime()
    await grantEntitlement(db, { userId: user.id, batchId: paid.id, accessDays: 365 })
    const after = (await entFor(db, user.id, paid.id))!.expiresAt!.getTime()
    expect(after).toBeGreaterThan(before)
  })
})
