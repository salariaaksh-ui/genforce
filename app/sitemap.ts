import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/site"
import { SAMPLE_LISTINGS } from "@/lib/sample-listings"

/**
 * XML sitemap (served at /sitemap.xml). Static pages + one entry per listing.
 * TODO(client): when listings come from a CMS/feed, map over that source here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url

  const staticRoutes = ["", "/listings", "/about", "/contact", "/privacy", "/terms"]
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" || path === "/listings" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }))

  const listingEntries: MetadataRoute.Sitemap = SAMPLE_LISTINGS.map((p) => ({
    url: `${base}/listings/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticEntries, ...listingEntries]
}
