import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/site"

/**
 * robots.txt (served at /robots.txt).
 *
 * IMPORTANT (CLAUDE.md §6): do NOT block AI crawlers. The rule below allows
 * everything, which includes ClaudeBot, GPTBot, and PerplexityBot. If a client
 * ever needs to restrict paths, add Disallow entries to the "*" group — never
 * add a per-bot block for ClaudeBot / GPTBot / PerplexityBot. AI-referred
 * traffic is a high-converting channel for real estate.
 *
 * Do not ship a site-wide `noindex` — staging noindex must be removed at launch.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // TODO(client): e.g. disallow: ["/api/"] if you add private routes.
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
