import { buildDb } from "./build"

// App-wide db handle. Next (ESM) resolves the top-level await; tsx scripts that
// need a db import `buildDb` from ./build directly (a tsx-CJS module can't have a
// top-level await). See ./build for the postgres:// vs pglite:// branch.
export const db = await buildDb()
