import type { Area, ListingStatus, PriceQualifier, Property } from "@/lib/types"

/**
 * Display helpers shared by the property card and the listing detail page.
 * Currency/locale are per-client — override CURRENCY / LOCALE here or wire
 * them to config when you duplicate the template.
 */
export const CURRENCY = "AUD"
export const LOCALE = "en-AU"

const STATUS_LABELS: Record<ListingStatus, string> = {
  "for-sale": "For Sale",
  "under-offer": "Under Offer",
  "under-contract": "Under Contract",
  sold: "Sold",
  leased: "Leased",
  "off-market": "Off Market",
}

export function statusLabel(status: ListingStatus): string {
  return STATUS_LABELS[status]
}

const AREA_UNIT_LABELS: Record<Area["unit"], string> = {
  m2: "m²",
  sqft: "sqft",
  acres: "acres",
}

export function formatArea(area?: Area): string | null {
  if (!area) return null
  return `${area.value.toLocaleString(LOCALE)} ${AREA_UNIT_LABELS[area.unit]}`
}

/**
 * Price display honoring the qualifier.
 * POA never shows a number; auction/offers-over prefix the amount.
 */
export function formatPrice(
  price: number | null,
  qualifier: PriceQualifier
): string {
  if (qualifier === "poa" || price === null) return "Price on application"

  const amount = new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(price)

  switch (qualifier) {
    case "offers-over":
      return `Offers over ${amount}`
    case "auction":
      return `Auction – guide ${amount}`
    case "fixed":
    default:
      return amount
  }
}

/** Full single-line address. */
export function formatAddress(p: Property): string {
  const { street, suburb, state, postcode } = p.address
  return `${street}, ${suburb} ${state} ${postcode}`
}

/** Hero photo (explicit isHero, else first). Returns undefined if no photos. */
export function heroPhoto(p: Property) {
  return p.photos.find((ph) => ph.isHero) ?? p.photos[0]
}
