import type { Agent, Property } from "@/lib/types"

/**
 * ⚠️ SAMPLE DATA — FOR DEVELOPMENT ONLY. REPLACE PER CLIENT BEFORE LAUNCH.
 *
 * These fake listings exist so components have something to render. Swap this
 * whole file for the client's real listing source (structured JSON, a headless
 * CMS like Sanity, a Google Sheet, or an MLS/IDX feed — see CLAUDE.md §1).
 * Photos live in /public/sample and are generated placeholders — replace with
 * real, licensed photography. Remove all sample content at launch (Launch
 * checklist: "Remove all test/placeholder content").
 */

export const IS_SAMPLE_DATA = true

const AGENTS: Record<string, Agent> = {
  jordan: {
    id: "agent-jordan",
    name: "Jordan Sample",
    title: "Sales Associate",
    phone: "+61 400 000 001",
    email: "jordan@example-agency.com",
    photo: "/sample/agent-01.jpg",
  },
  riley: {
    id: "agent-riley",
    name: "Riley Placeholder",
    title: "Principal",
    phone: "+61 400 000 002",
    email: "riley@example-agency.com",
    photo: "/sample/agent-02.jpg",
  },
  sam: {
    id: "agent-sam",
    name: "Sam Example",
    title: "Property Consultant",
    phone: "+61 400 000 003",
    email: "sam@example-agency.com",
    photo: "/sample/agent-03.jpg",
  },
}

export const SAMPLE_LISTINGS: Property[] = [
  {
    id: "SMPL-1001",
    slug: "12-example-street-brookvale",
    price: 1850000,
    priceQualifier: "fixed",
    status: "for-sale",
    propertyType: "house",
    bedrooms: 4,
    bathrooms: 2,
    carSpaces: 2,
    internalArea: { value: 210, unit: "m2" },
    landArea: { value: 615, unit: "m2" },
    address: {
      street: "12 Example Street",
      suburb: "Brookvale",
      state: "NSW",
      postcode: "2100",
    },
    geo: { lat: -33.765, lng: 151.271 },
    photos: [
      { src: "/sample/property-01.jpg", alt: "Front facade of a single-storey brick home with garden", isHero: true },
      { src: "/sample/property-02.jpg", alt: "Open-plan living and dining area with timber floors" },
      { src: "/sample/property-03.jpg", alt: "Backyard with covered outdoor entertaining area" },
    ],
    description:
      "A bright, north-facing family home on a generous level block. Open-plan living flows to a covered alfresco and landscaped yard. Walk to shops, transport and quality schools. (Sample copy — replace with the client's real listing description.)",
    features: [
      "Ducted air conditioning",
      "Solar panels",
      "Double lock-up garage",
      "Landscaped level yard",
      "Renovated kitchen with stone benchtops",
    ],
    agents: [AGENTS.jordan, AGENTS.riley],
    inspectionTimes: [
      { start: "2026-08-01T10:00:00+10:00", end: "2026-08-01T10:30:00+10:00" },
      { start: "2026-08-05T17:30:00+10:00", end: "2026-08-05T18:00:00+10:00" },
    ],
  },
  {
    id: "SMPL-1002",
    slug: "5-201-sample-avenue-bondi",
    price: 995000,
    priceQualifier: "offers-over",
    status: "for-sale",
    propertyType: "apartment",
    bedrooms: 2,
    bathrooms: 1,
    carSpaces: 1,
    internalArea: { value: 84, unit: "m2" },
    address: {
      street: "5/201 Sample Avenue",
      suburb: "Bondi",
      state: "NSW",
      postcode: "2026",
    },
    geo: { lat: -33.891, lng: 151.277 },
    photos: [
      { src: "/sample/property-04.jpg", alt: "Sunlit apartment living room with balcony access", isHero: true },
      { src: "/sample/property-05.jpg", alt: "Modern kitchen with breakfast bar" },
    ],
    description:
      "A stylish two-bedroom apartment moments from the beach, cafés and transport. Light-filled interiors open to a private balcony. Secure parking and lift access. (Sample copy — replace per client.)",
    features: [
      "Private balcony",
      "Secure basement parking",
      "Lift access",
      "Intercom entry",
      "Internal laundry",
    ],
    agents: [AGENTS.sam],
    inspectionTimes: [
      { start: "2026-08-02T11:00:00+10:00", end: "2026-08-02T11:30:00+10:00" },
    ],
  },
  {
    id: "SMPL-1003",
    slug: "8-placeholder-lane-newtown",
    price: 1400000,
    priceQualifier: "auction",
    status: "under-offer",
    propertyType: "townhouse",
    bedrooms: 3,
    bathrooms: 2,
    carSpaces: 1,
    internalArea: { value: 150, unit: "m2" },
    landArea: { value: 180, unit: "m2" },
    address: {
      street: "8 Placeholder Lane",
      suburb: "Newtown",
      state: "NSW",
      postcode: "2042",
    },
    geo: { lat: -33.898, lng: 151.179 },
    photos: [
      { src: "/sample/property-06.jpg", alt: "Contemporary townhouse street frontage", isHero: true },
      { src: "/sample/property-07.jpg", alt: "Double-height living space with large windows" },
    ],
    description:
      "A contemporary tri-level townhouse in the heart of the inner west. Flexible living, a private courtyard and a lock-up garage. Steps to dining, bars and rail. (Sample copy — replace per client.)",
    features: [
      "Tri-level design",
      "Private courtyard",
      "Lock-up garage",
      "Study nook",
      "Walk to station",
    ],
    agents: [AGENTS.riley],
    inspectionTimes: [
      { start: "2026-08-03T12:00:00+10:00", end: "2026-08-03T12:30:00+10:00" },
    ],
  },
  {
    id: "SMPL-1004",
    slug: "lot-4-sample-road-byron-bay",
    price: null,
    priceQualifier: "poa",
    status: "sold",
    propertyType: "land",
    bedrooms: 0,
    bathrooms: 0,
    carSpaces: 0,
    landArea: { value: 1.2, unit: "acres" },
    address: {
      street: "Lot 4 Sample Road",
      suburb: "Byron Bay",
      state: "NSW",
      postcode: "2481",
    },
    geo: { lat: -28.643, lng: 153.612 },
    photos: [
      { src: "/sample/property-08.jpg", alt: "Cleared rural block with distant tree line", isHero: true },
    ],
    description:
      "A rare hinterland parcel with elevated building envelope and rural outlook. Services to the boundary. (Sample copy — replace per client.)",
    features: ["Elevated building envelope", "Services to boundary", "Rural outlook"],
    agents: [AGENTS.jordan],
    inspectionTimes: [],
  },
]

export function getSampleListingBySlug(slug: string): Property | undefined {
  return SAMPLE_LISTINGS.find((p) => p.slug === slug)
}

/** Featured selection for the home page (first 3 that are still available). */
export function getFeaturedListings(limit = 3): Property[] {
  const available = SAMPLE_LISTINGS.filter(
    (p) => p.status === "for-sale" || p.status === "under-offer"
  )
  return available.slice(0, limit)
}
