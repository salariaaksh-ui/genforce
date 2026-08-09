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
  if (!phone) throw new Error("Enter a valid 10-digit phone number")
  await db.update(users).set({ phone }).where(eq(users.id, user.id))
  revalidatePath("/profile")
}
