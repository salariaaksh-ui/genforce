import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep PGlite (offline-dev embedded Postgres) external so the bundler never
  // tries to bundle its wasm. Inert in production, which uses postgres.js.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
