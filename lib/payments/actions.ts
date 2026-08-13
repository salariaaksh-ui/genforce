"use server"

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { requireUser } from "@/lib/auth/guards"
import { createOrder } from "./core"

/** Server action called from the checkout page. Binds requireUser + the app db
 *  to the db-injected core. */
export async function createCourseOrder(batchId: string) {
  const sessionUser = await requireUser()
  const user = await db.query.users.findFirst({ where: eq(users.id, sessionUser.id) })
  if (!user?.activeExamId) throw new Error("no active exam")
  return createOrder(db, { userId: user.id, examId: user.activeExamId, batchId })
}
