import { describe, it, expect, beforeEach } from "vitest"
import { freshTestDb, type TestDb } from "./testdb"
import * as s from "./schema"
import * as a from "./admin"

let db: TestDb
let examId: string
let subjectId: string

beforeEach(async () => {
  db = await freshTestDb()
  const [e] = await db.insert(s.exams).values({ slug: "afcat", name: "AFCAT" }).returning()
  examId = e.id
  const [b] = await db.insert(s.batches).values({ examId, name: "Batch 1" }).returning()
  const [sub] = await db.insert(s.subjects).values({ batchId: b.id, name: "Maths" }).returning()
  subjectId = sub.id
})

describe("admin lessons", () => {
  it("auto-increments idx per subject", async () => {
    await a.createLesson(db, { subjectId, title: "L1", source: "youtube", playUrl: "u" })
    await a.createLesson(db, { subjectId, title: "L2", source: "youtube", playUrl: "u" })
    const rows = await a.listLessons(db, subjectId)
    expect(rows.map((r) => r.idx)).toEqual([1, 2])
  })

  it("create then delete round-trips", async () => {
    await a.createLesson(db, { subjectId, title: "L1", source: "youtube", playUrl: "u" })
    const [l] = await a.listLessons(db, subjectId)
    await a.deleteLesson(db, l.id)
    expect(await a.listLessons(db, subjectId)).toHaveLength(0)
  })
})

describe("admin pdfs", () => {
  it("derives a sha256 fileHash from the url", async () => {
    await a.createPdf(db, { examId, filename: "notes", url: "https://x/y.pdf" })
    const rows = await a.listPdfs(db, examId)
    expect(rows).toHaveLength(1)
    expect(rows[0].fileHash).toMatch(/^[a-f0-9]{64}$/)
  })
})

describe("admin batches", () => {
  it("create, update, delete", async () => {
    await a.createBatch(db, { examId, name: "New Batch", priceInr: 999 })
    let b = (await a.listBatches(db, examId)).find((x) => x.name === "New Batch")!
    expect(b.priceInr).toBe(999)
    await a.updateBatch(db, b.id, { priceInr: 1500 })
    b = (await a.getBatch(db, b.id))!
    expect(b.priceInr).toBe(1500)
    await a.deleteBatch(db, b.id)
    expect((await a.listBatches(db, examId)).find((x) => x.name === "New Batch")).toBeUndefined()
  })
})
