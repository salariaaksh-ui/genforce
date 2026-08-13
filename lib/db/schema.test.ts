import { describe, it, expect } from "vitest"
import { sql } from "drizzle-orm"
import { freshTestDb } from "./testdb"
import * as schema from "./schema"

describe("payments migrations", () => {
  it("creates orders + entitlements and drops plans", async () => {
    const db = await freshTestDb()
    const [exam] = await db.insert(schema.exams).values({ slug: "afcat", name: "AFCAT" }).returning()
    const [user] = await db.insert(schema.users).values({ email: "a@b.c" }).returning()
    const [batch] = await db
      .insert(schema.batches)
      .values({ examId: exam.id, name: "PRO", priceInr: 9999, accessDays: 180 })
      .returning()

    const [order] = await db
      .insert(schema.orders)
      .values({ userId: user.id, batchId: batch.id, amountInr: 9999, razorpayOrderId: "order_x" })
      .returning()
    expect(order.status).toBe("created")

    const [ent] = await db
      .insert(schema.entitlements)
      .values({ userId: user.id, batchId: batch.id, orderId: order.id })
      .returning()
    expect(ent.expiresAt).toBeNull() // lifetime unless set

    // plans table is gone
    await expect(db.execute(sql`select 1 from plans`)).rejects.toThrow()
  })

  it("enforces one entitlement per (user, batch)", async () => {
    const db = await freshTestDb()
    const [exam] = await db.insert(schema.exams).values({ slug: "nda", name: "NDA" }).returning()
    const [user] = await db.insert(schema.users).values({ email: "d@e.f" }).returning()
    const [batch] = await db.insert(schema.batches).values({ examId: exam.id, name: "B" }).returning()
    await db.insert(schema.entitlements).values({ userId: user.id, batchId: batch.id })
    await expect(
      db.insert(schema.entitlements).values({ userId: user.id, batchId: batch.id })
    ).rejects.toThrow()
  })
})
