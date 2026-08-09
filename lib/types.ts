/**
 * Canonical property record — REAL-ESTATE-CHECKLIST.md RE-1.
 * Every listing must carry these fields so pages render consistently and
 * listings stay filterable/sortable. Lock this schema before build; extend
 * per client only if their brief genuinely needs more.
 */

/** Price qualifier — how the price is expressed. */
export type PriceQualifier = "fixed" | "offers-over" | "auction" | "poa"

/** Listing status — first-class state that drives badges, filters, SEO. */
export type ListingStatus =
  | "for-sale"
  | "under-offer"
  | "under-contract"
  | "sold"
  | "leased"
  | "off-market"

/** Property type. */
export type PropertyType =
  | "house"
  | "apartment"
  | "townhouse"
  | "land"
  | "commercial"

/** Area unit — keep the unit with the number, never assume. */
export type AreaUnit = "m2" | "sqft" | "acres"

export interface Area {
  value: number
  unit: AreaUnit
}

export interface Photo {
  /** Path under /public or a remote URL configured in next.config images. */
  src: string
  /** Descriptive alt: room / feature / address context. Required (WCAG). */
  alt: string
  /** Exactly one photo per listing should be the hero. */
  isHero?: boolean
}

export interface Address {
  street: string
  suburb: string
  state: string
  postcode: string
}

export interface GeoCoordinates {
  lat: number
  lng: number
}

/** Open-home / inspection window. ISO 8601 strings. */
export interface InspectionTime {
  /** ISO 8601, e.g. "2026-08-02T10:00:00+10:00". */
  start: string
  /** ISO 8601. */
  end: string
}

export interface Agent {
  id: string
  name: string
  phone: string
  email: string
  /** Path under /public or remote URL. */
  photo?: string
  /** e.g. "Sales Associate", "Principal". */
  title?: string
}

export interface Property {
  /** Stable listing ID — never reused, safe for URLs and CRM refs. */
  id: string
  /** URL slug, e.g. "12-example-st-brookvale-2100". */
  slug: string

  /** Amount in the site's currency. null when POA (price on application). */
  price: number | null
  priceQualifier: PriceQualifier

  status: ListingStatus
  propertyType: PropertyType

  bedrooms: number
  bathrooms: number
  carSpaces: number

  internalArea?: Area
  landArea?: Area

  address: Address
  geo: GeoCoordinates

  /** Ordered; first isHero (or first item) is the LCP hero image. */
  photos: Photo[]
  description: string
  features: string[]

  /** One or more listing agents; enquiries route to these. */
  agents: Agent[]
  inspectionTimes: InspectionTime[]
}
