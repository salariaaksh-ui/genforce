import { drizzle } from "drizzle-orm/postgres-js"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

const url = process.env.DATABASE_URL ?? ""

/**
 * Real Postgres (Neon / local PG): postgres.js — the production path.
 *
 * Offline dev: set `DATABASE_URL=pglite://<dir>` to run an embedded, in-process
 * Postgres (PGlite) — no server, no install, data persisted to <dir>. PGlite is
 * a devDependency, so it's imported dynamically INSIDE this branch: a production
 * build with a postgres:// URL never resolves it. Seed the dir with
 * `npm run db:local`. See README "Offline dev (no database)".
 */
async function makeDb(): Promise<PostgresJsDatabase<typeof schema>> {
  if (url.startsWith("pglite")) {
    const { PGlite } = await import("@electric-sql/pglite")
    const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite")
    const dir = url.replace(/^pglite:(\/\/)?/, "") || ".pglite"
    // Same query API as postgres-js for everything this app uses; cast so call
    // sites keep one db type.
    return drizzlePglite(new PGlite(dir), { schema }) as unknown as PostgresJsDatabase<typeof schema>
  }
  return drizzle(postgres(url, { max: 1 }), { schema })
}

export const db = await makeDb()
