import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep PGlite (offline-dev embedded Postgres) external so the bundler never
  // tries to bundle its wasm. Inert in production, which uses postgres.js.
  serverExternalPackages: ["@electric-sql/pglite"],

  // Security headers on every response. These five are zero-risk (no allowlist
  // to break) and cover the CLAUDE.md §2 non-negotiables.
  // ponytail: a full content-CSP (script-src/frame-src for Razorpay Checkout +
  // Google OAuth) needs the live payment flow to test end-to-end — add it once
  // real Razorpay keys land, so a mis-scoped directive can't white-screen the app.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
        ],
      },
    ]
  },
};

export default nextConfig;
