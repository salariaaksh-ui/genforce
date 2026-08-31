// Set batch thumbnails to the cropped poster graphics in public/courses/.
// Matches by exact batch name.
//   node --env-file=.env.dbrun --import tsx scripts/set-thumbnails.mts
import { eq } from "drizzle-orm"
import { buildDb } from "../lib/db/build"
import { batches } from "../lib/db/schema"

const MAP: Record<string, string> = {
  "Achieve CAPF Batch (Game Changer 2027)": "/courses/capf-game-changer.webp",
  "Achieve CAPF Foundation Programme": "/courses/capf-foundation.webp",
  "CDS Journey - Juliet Batch": "/courses/cds-juliet.webp",
  "CDS Journey - Indian Batch": "/courses/cds-indian.webp",
}

const db = await buildDb()
for (const [name, thumb] of Object.entries(MAP)) {
  const r = await db.update(batches).set({ thumbnail: thumb }).where(eq(batches.name, name)).returning({ id: batches.id })
  console.log(`${r.length ? "set" : "NO MATCH"}: ${name} -> ${thumb}`)
}
process.exit(0)
