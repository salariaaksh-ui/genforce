import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/site"

/** XML sitemap (served at /sitemap.xml). Public routes only. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url
  const routes = ["", "/privacy", "/terms"]
  return routes.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.5,
  }))
}
