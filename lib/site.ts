/**
 * Central per-client configuration. When you duplicate this template, most
 * "swap per client" edits happen HERE plus the brand tokens in app/globals.css
 * and the logo in /public. Search the repo for BRAND_ and TODO to find the rest.
 */

export const siteConfig = {
  /** TODO(client): brand/agency name. Shows in header, footer, <title>, schema. */
  name: "BRAND_NAME",
  /** TODO(client): one-line value proposition. */
  tagline: "Real estate, done right in your neighbourhood.",
  description:
    "BRAND_NAME helps buyers and sellers across the region. Browse current listings, meet the team, and get in touch.",
  /**
   * TODO(client): production origin. Used for metadataBase, canonical URLs,
   * sitemap, robots. Override with NEXT_PUBLIC_SITE_URL at build time.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.example-agency.com",

  /** Top-level nav — keep it shallow (CLAUDE.md §2). */
  nav: [
    { title: "Home", href: "/" },
    { title: "Listings", href: "/listings" },
    { title: "About", href: "/about" },
    { title: "Contact", href: "/contact" },
  ],

  /** TODO(client): canonical NAP — must match GBP + directories exactly. */
  contact: {
    phone: "+61 2 0000 0000",
    phoneHref: "tel:+61200000000",
    email: "hello@example-agency.com",
    address: {
      street: "100 Placeholder Street",
      suburb: "Sampletown",
      state: "NSW",
      postcode: "2000",
      country: "Australia",
    },
    /** TODO(client): display licence / registration number if required. */
    licenceNumber: "Licence No. 0000000",
  },

  legal: [
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms", href: "/terms" },
  ],
} as const

export function fullAddress() {
  const a = siteConfig.contact.address
  return `${a.street}, ${a.suburb} ${a.state} ${a.postcode}`
}
