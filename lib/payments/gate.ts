// Pure access-gate logic — no db, no Next. A course (batch) is "paid" when it
// carries a positive price; a paid batch needs a live entitlement to unlock.
// Free batches (no/zero price) are always open.

export type BatchPrice = { priceInr: number | null }
export type Ent = { expiresAt: Date | null } | undefined | null

export function isPaid(batch: BatchPrice): boolean {
  return batch.priceInr != null && batch.priceInr > 0
}

/** An entitlement is live if it exists and hasn't expired (null expiry = lifetime). */
export function isLive(ent: Ent, now: Date = new Date()): boolean {
  if (!ent) return false
  return ent.expiresAt == null || ent.expiresAt.getTime() > now.getTime()
}

export function isUnlocked(batch: BatchPrice, ent: Ent, now: Date = new Date()): boolean {
  return !isPaid(batch) || isLive(ent, now)
}
