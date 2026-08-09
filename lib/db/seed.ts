import { db } from "./index"
import { exams } from "./schema"
import { EXAM_SLUGS, EXAM_LABEL } from "../exams"

export async function seed() {
  for (const slug of EXAM_SLUGS) {
    await db
      .insert(exams)
      .values({ slug, name: EXAM_LABEL[slug] })
      .onConflictDoNothing({ target: exams.slug })
  }
}

seed()
  .then(() => {
    console.log("seeded")
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
