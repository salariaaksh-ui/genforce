import { drizzle } from "drizzle-orm/postgres-js"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

/**
 * Build the drizzle db from DATABASE_URL.
 *
 * postgres:// (Neon / local PG) is the production path. `pglite://<dir>` runs an
 * embedded in-process PGlite for offline dev — imported dynamically inside the
 * branch so a production build with a postgres:// URL never resolves the
 * devDependency.
 *
 * No top-level await here (only an async function), so this is safe to import
 * from tsx-run scripts as well as from Next. The app awaits it once in ./index.ts.
 */
export async function buildDb(): Promise<PostgresJsDatabase<typeof schema>> {
  const url = process.env.DATABASE_URL ?? ""
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
