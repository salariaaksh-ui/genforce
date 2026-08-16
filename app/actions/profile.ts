"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { requireUser } from "@/lib/auth/guards"
import { normalizePhone } from "@/lib/validation"

export async function updatePhone(formData: FormData) {
  const user = await requireUser()
  const phone = normalizePhone(String(formData.get("phone") ?? ""))
  // Invalid/empty input is ignored rather than thrown: /profile sits outside the
  // (app) error boundary, so a thrown Server Action here would crash the whole
  // page to the global error screen. The input also validates in the browser.
  if (!phone) return
  await db.update(users).set({ phone }).where(eq(users.id, user.id))
  revalidatePath("/profile")
}
