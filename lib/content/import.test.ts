import { describe, it, expect, beforeEach } from "vitest"
import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { eq } from "drizzle-orm"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import * as schema from "@/lib/db/schema"
import { importContent } from "./import"
import type { Content } from "./schema"

async function freshDb() {
  const pg = new PGlite()
  const db = drizzle(pg, { schema })
  await migrate(db, { migrationsFolder: "./drizzle" })
  await db.insert(schema.exams).values({ slug: "afcat", name: "AFCAT" })
  return db as unknown as PostgresJsDatabase<typeof schema>
}

const content: Content = {
  exam: "afcat",
  batches: [
    {
      name: "JULIET",
      cycle: "AFCAT 1 2027",
      sort: 0,
      thumbnail: "/c/j.jpg",
      priceInr: 2540,
      description: undefined,
      subjects: [
        {
          name: "Maths",
          teacher: "AG",
          coverImage: undefined,
          sort: 0,
          lessons: [
            { idx: 1, title: "P1", source: "vimeo", playUrl: "https://player.vimeo.com/video/1" },
            { idx: 2, title: "P2", source: "vimeo", playUrl: "https://player.vimeo.com/video/2" },
          ],
        },
      ],
    },
  ],
  pdfs: [{ filename: "a.pdf", url: "https://x/a.pdf", fileHash: "h1" }],
  gallery: [{ url: "https://x/1.jpg" }],
  tests: [{ setName: "M1", timeLimitMin: 120, formUrl: "https://x/viewform", formDate: "2026-01-15" }],
}

describe("importContent", () => {
  let db: PostgresJsDatabase<typeof schema>
  beforeEach(async () => {
    db = await freshDb()
  })

  it("inserts the full tree on first run", async () => {
    const r = await importContent(db, content)
    expect(r.batches).toEqual({ inserted: 1, updated: 0 })
    expect(r.lessons).toEqual({ inserted: 2, updated: 0 })
    expect(r.pdfs).toEqual({ inserted: 1, skipped: 0 })
    const lessons = await db.query.lessons.findMany()
    expect(lessons).toHaveLength(2)
  })

  it("is idempotent: second identical run inserts nothing, updates existing", async () => {
    await importContent(db, content)
    const r = await importContent(db, content)
    expect(r.batches).toEqual({ inserted: 0, updated: 1 })
    expect(r.lessons).toEqual({ inserted: 0, updated: 2 })
    expect(r.pdfs).toEqual({ inserted: 0, skipped: 1 })
    expect(await db.query.batches.findMany()).toHaveLength(1)
    expect(await db.query.lessons.findMany()).toHaveLength(2)
  })

  it("updates a changed field on re-import", async () => {
    await importContent(db, content)
    const changed = structuredClone(content)
    changed.batches[0].priceInr = 3000
    await importContent(db, changed)
    const b = await db.query.batches.findFirst({ where: eq(schema.batches.name, "JULIET") })
    expect(b?.priceInr).toBe(3000)
  })

  it("derives a pdf hash from url when omitted (dedupes by url)", async () => {
    const noHash: Content = { ...content, pdfs: [{ filename: "b.pdf", url: "https://x/b.pdf" }] }
    await importContent(db, noHash)
    const r = await importContent(db, noHash)
    expect(r.pdfs).toEqual({ inserted: 0, skipped: 1 })
  })

  it("round-trips batch accessDays", async () => {
    const withDays = structuredClone(content)
    withDays.batches[0].accessDays = 180
    await importContent(db, withDays)
    const b = await db.query.batches.findFirst({ where: eq(schema.batches.name, "JULIET") })
    expect(b?.accessDays).toBe(180)
  })

  it("throws if the exam is not seeded", async () => {
    const pg = new PGlite()
    const bare = drizzle(pg, { schema })
    await migrate(bare, { migrationsFolder: "./drizzle" })
    await expect(
      importContent(bare as unknown as PostgresJsDatabase<typeof schema>, content)
    ).rejects.toThrow(/not seeded/)
  })
})
