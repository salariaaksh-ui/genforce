// Read-only: print every batch with its exam, price and id. Run against prod to
// discover the real batch names before a price update.
//   npx vercel env pull .env.production.local --environment=production
//   node --env-file=.env.production.local --import tsx scripts/list-batches.mts
import { buildDb } from "../lib/db/build"
import { batches, exams } from "../lib/db/schema"
import { eq } from "drizzle-orm"

const db = await buildDb()
const rows = await db
  .select({
    id: batches.id,
    exam: exams.slug,
    name: batches.name,
    price: batches.priceInr,
  })
  .from(batches)
  .leftJoin(exams, eq(batches.examId, exams.id))

for (const r of rows) console.log(`${r.exam}\t₹${r.price}\t${r.name}\t[${r.id}]`)
console.log(`\n${rows.length} batches`)
process.exit(0)
