import { buildDb } from "./build"
import { exams } from "./schema"
import { EXAM_SLUGS, EXAM_LABEL } from "../exams"

// Uses buildDb() (not the top-level-await `db` from ./index) so tsx can run this
// as a script — a CJS module can't require an async ESM module.
export async function seed() {
  const db = await buildDb()
  for (const slug of EXAM_SLUGS) {
    await db
      .insert(exams)
      .values({ slug, name: EXAM_LABEL[slug] })
      .onConflictDoNothing({ target: exams.slug })
  }
}

seed()
  .then(() => {
    console.log("seeded exams:", EXAM_SLUGS.join(", "))
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
