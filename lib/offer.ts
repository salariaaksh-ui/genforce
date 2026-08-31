// Early-bird launch offer: a flat percentage off every paid batch, live until a
// single campaign deadline. The deadline is one ISO timestamp in OFFER_ENDS_AT
// (env) — unset, invalid, or past = no offer and full prices everywhere. The
// discount is enforced server-side at order creation (lib/payments/core.ts);
// the countdown is display-only.

export const OFFER_PERCENT = 10

/** Campaign end, or null when no offer is configured / it's malformed. */
export function offerEndsAt(): Date | null {
  const v = process.env.OFFER_ENDS_AT
  if (!v) return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

export function offerActive(now: Date = new Date()): boolean {
  const end = offerEndsAt()
  return end != null && now < end
}

/** Discounted rupee price during an active offer (rounded to whole rupees). */
export function discountedInr(priceInr: number): number {
  return Math.round(priceInr * (1 - OFFER_PERCENT / 100))
}
