import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/site"

/**
 * robots.txt (served at /robots.txt).
 *
 * Do NOT block AI crawlers (ClaudeBot, GPTBot, PerplexityBot) — the "*" allow
 * covers them. Private/app routes are disallowed from indexing; never add a
 * per-bot block for the AI crawlers. No site-wide `noindex` — remove any
 * staging noindex at launch.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/onboarding", "/profile", "/api/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
