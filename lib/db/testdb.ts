import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import * as schema from "./schema"

export type TestDb = PostgresJsDatabase<typeof schema>

/** Fresh in-memory PGlite with all migrations applied. Test-only helper. */
export async function freshTestDb(): Promise<TestDb> {
  const pg = new PGlite()
  const db = drizzle(pg, { schema })
  await migrate(db, { migrationsFolder: "./drizzle" })
  return db as unknown as TestDb
}
