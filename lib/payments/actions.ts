"use server"

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { requireUser } from "@/lib/auth/guards"
import { createOrder, OrderError, type OrderErrorCode } from "./core"

/** What the checkout button gets back. A *returned* result survives to the
 *  client unchanged; a *thrown* error has its message redacted in production
 *  builds (replaced by the generic "Server Components render" digest string),
 *  so every user-facing outcome is returned, never thrown. */
export type CreateOrderResult =
  | { ok: true; orderId: string; amountInr: number; keyId: string | null }
  | { ok: false; code: OrderErrorCode | "no_exam" | "unavailable"; message: string }

const ORDER_ERROR_MESSAGES: Record<OrderErrorCode, string> = {
  not_found: "This course isn’t available right now.",
  // free / already_enrolled aren't shown — the client just opens the course.
  free: "This course is free — no payment needed.",
  already_enrolled: "You already have access to this course.",
}

/** Server action called from the checkout page. Binds requireUser + the app db
 *  to the db-injected core, and translates every failure into a safe result so
 *  the student never sees a raw framework error digest. */
export async function createCourseOrder(batchId: string): Promise<CreateOrderResult> {
  // requireUser() may redirect() (which throws NEXT_REDIRECT) — that must
  // propagate to Next, so it stays outside the try.
  const sessionUser = await requireUser()

  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, sessionUser.id) })
    if (!user?.activeExamId) {
      return { ok: false, code: "no_exam", message: "Choose your exam before buying a course." }
    }
    const order = await createOrder(db, {
      userId: user.id,
      examId: user.activeExamId,
      batchId,
    })
    return { ok: true, ...order }
  } catch (err) {
    // Expected, caller-actionable outcome: pass its code + a safe message through.
    if (err instanceof OrderError) {
      return { ok: false, code: err.code, message: ORDER_ERROR_MESSAGES[err.code] }
    }
    // Unexpected (Razorpay keys/API/network, DB, …). Log the real cause to the
    // server (Vercel) logs, and return a distinct — but still non-leaky — message
    // per category so the failure is diagnosable on-screen without the logs:
    //   • keys absent  → "not set up yet"
    //   • keys present but Razorpay rejected them → "couldn't reach the gateway"
    console.error("[checkout] createCourseOrder failed for batch", batchId, err)
    const detail = err instanceof Error ? err.message : ""
    if (detail.includes("not configured")) {
      return {
        ok: false,
        code: "unavailable",
        message: "Online payments aren’t set up yet. Please contact support to enrol.",
      }
    }
    if (detail.startsWith("Razorpay order failed")) {
      return {
        ok: false,
        code: "unavailable",
        message:
          "We couldn’t reach the payment gateway. Please try again shortly, or contact support if it keeps happening.",
      }
    }
    return {
      ok: false,
      code: "unavailable",
      message: "We couldn’t start the payment just now. Please try again in a moment.",
    }
  }
}
