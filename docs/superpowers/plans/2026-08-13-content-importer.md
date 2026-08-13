# Content Importer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A CLI that loads one JSON-per-exam content file into the DB, idempotently, for the existing Exam→Batch→Subject→Lesson model plus exam-wide PDF/gallery/test pools.

**Architecture:** A pure zod validation layer (`lib/content/schema.ts`) parses + validates the file with no I/O. A loader (`lib/content/import.ts`) takes the validated data + a drizzle `db` and does find-then-upsert for hierarchical entities and insert-or-skip for the append-only pools, all in one transaction. A thin CLI (`scripts/import-content.mts`) wires file → parse → load, with a `--dry` validate-only mode.

**Tech Stack:** TypeScript, Drizzle ORM (postgres-js in prod / PGlite offline), zod v4, tsx, vitest. Node `crypto` for hashing.

## Global Constraints

- Framework Next.js 16 (App Router); route middleware file is `proxy.ts`, not `middleware.ts`.
- DB access only through `@/lib/db` (`db`), typed `PostgresJsDatabase<typeof schema>`. PGlite is scheme-gated via `DATABASE_URL=pglite://<dir>` and is dev-only.
- Exam slugs are exactly `["afcat","nda","cds","capf"]` from `@/lib/exams` (`EXAM_SLUGS`). The 4 exam rows are seeded by `npm run db:seed`; the importer never creates exams.
- One content file = one exam. `batches`/`pdfs`/`gallery`/`tests` are each optional (default `[]`).
- Idempotent: re-running the same file makes no duplicates and updates changed fields. Nothing is ever deleted.
- Money values (`priceInr`) are integers (whole rupees), nullable, stored but unused until the payments spec.
- Migrations: edit `lib/db/schema.ts`, then `npm run db:generate` (drizzle-kit) to emit the SQL; `npm run db:local` applies migrations to the offline PGlite DB.
- Tests: `npm test` (vitest). Keep the pure layer's tests DB-free; the loader test uses an in-memory PGlite.

---

### Task 1: Schema fields + unique keys + migration

**Files:**
- Modify: `lib/db/schema.ts` (batches, subjects, galleryImages, testForms)
- Create: `drizzle/000N_*.sql` + snapshot (generated, do not hand-write)

**Interfaces:**
- Produces: `batches.thumbnail`, `batches.description` (text, nullable), `batches.priceInr` (integer, nullable); unique keys `batches(exam_id,name)`, `subjects(batch_id,name)`, `gallery_images(exam_id,url)`, `test_forms(exam_id,set_name)`. Consumed by Task 3.

- [ ] **Step 1: Add columns + unique constraints to schema**

In `lib/db/schema.ts`, update `batches` to add three columns and a unique key:

```ts
export const batches = pgTable(
  "batches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    cycle: text("cycle"),
    thumbnail: text("thumbnail"),
    description: text("description"),
    priceInr: integer("price_inr"),
    sort: integer("sort").default(0).notNull(),
  },
  (t) => ({ examName: unique().on(t.examId, t.name) })
)
```

Add a unique key to `subjects` (keep existing columns, add the second arg):

```ts
export const subjects = pgTable(
  "subjects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    teacher: text("teacher"),
    coverImage: text("cover_image"),
    sort: integer("sort").default(0).notNull(),
  },
  (t) => ({ batchName: unique().on(t.batchId, t.name) })
)
```

Add a unique key to `galleryImages`:

```ts
export const galleryImages = pgTable(
  "gallery_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({ examUrl: unique().on(t.examId, t.url) })
)
```

Add a unique key to `testForms`:

```ts
export const testForms = pgTable(
  "test_forms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, { onDelete: "cascade" }),
    setName: text("set_name"),
    timeLimitMin: integer("time_limit_min"),
    formUrl: text("form_url").notNull(),
    formDate: date("form_date"),
  },
  (t) => ({ examSet: unique().on(t.examId, t.setName) })
)
```

- [ ] **Step 2: Generate the migration**

Run: `npm run db:generate`
Expected: a new `drizzle/000N_*.sql` + updated `drizzle/meta/*` appear, containing `ALTER TABLE "batches" ADD COLUMN ...` and the four `ADD CONSTRAINT ... UNIQUE` statements. No prompt about data loss (all additive).

- [ ] **Step 3: Apply to the offline DB and verify it round-trips**

Run: `rm -rf .pglite && npm run db:local`
Expected: `seeded .pglite ...` with no migration error.

Then verify the new columns exist by importing the db and inserting a batch with them. Create a scratch check (delete after):

```bash
DATABASE_URL=pglite://.pglite node --import tsx -e '
import { db } from "./lib/db/index.ts"
import { exams, batches } from "./lib/db/schema.ts"
import { eq } from "drizzle-orm"
const e = await db.query.exams.findFirst({ where: eq(exams.slug, "afcat") })
const [b] = await db.insert(batches).values({ examId: e.id, name: "ZZ check", thumbnail: "/x.jpg", priceInr: 100, description: "d", sort: 9 }).returning()
console.log("ok", b.thumbnail, b.priceInr, b.description)
process.exit(0)
'
```
Expected: `ok /x.jpg 100 d`

- [ ] **Step 4: Commit**

```bash
git add lib/db/schema.ts drizzle/
git commit -m "feat(db): batch thumbnail/price/description + importer unique keys"
```

---

### Task 2: Content validation layer (pure, zod)

**Files:**
- Create: `lib/content/schema.ts`
- Test: `lib/content/schema.test.ts`

**Interfaces:**
- Consumes: `EXAM_SLUGS` from `@/lib/exams`.
- Produces: `type Content = { exam: ExamSlug; batches: Batch[]; pdfs: Pdf[]; gallery: {url:string}[]; tests: TestForm[] }` (zod-inferred); `class ContentError extends Error`; `parseContent(raw: unknown): { data: Content; warnings: string[] }` (throws `ContentError` listing every hard error). Consumed by Tasks 3 & 4.

- [ ] **Step 1: Write the failing tests**

Create `lib/content/schema.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { parseContent, ContentError } from "./schema"

const base = { exam: "afcat", batches: [], pdfs: [], gallery: [], tests: [] }

describe("parseContent", () => {
  it("accepts a minimal file and defaults arrays", () => {
    const { data } = parseContent({ exam: "afcat" })
    expect(data.exam).toBe("afcat")
    expect(data.batches).toEqual([])
    expect(data.pdfs).toEqual([])
  })

  it("accepts a full nested batch", () => {
    const { data } = parseContent({
      ...base,
      batches: [{
        name: "JULIET", cycle: "AFCAT 1 2027", thumbnail: "/c/j.jpg", priceInr: 2540,
        subjects: [{ name: "Maths", teacher: "AG", lessons: [
          { idx: 1, title: "P1", source: "vimeo", playUrl: "https://player.vimeo.com/video/1" },
        ] }],
      }],
    })
    expect(data.batches[0].subjects[0].lessons[0].idx).toBe(1)
    expect(data.batches[0].subjects[0].sort).toBe(0) // default applied
  })

  it("rejects an unknown exam slug", () => {
    expect(() => parseContent({ exam: "ssc" })).toThrow(ContentError)
  })

  it("rejects a lesson with neither playUrl nor playToken", () => {
    expect(() => parseContent({ ...base, batches: [{ name: "B", subjects: [{ name: "S", lessons: [
      { idx: 1, title: "x", source: "zoom" },
    ] }] }] })).toThrow(/playUrl or playToken/)
  })

  it("rejects a duplicate lesson idx within a subject", () => {
    expect(() => parseContent({ ...base, batches: [{ name: "B", subjects: [{ name: "S", lessons: [
      { idx: 1, title: "a", source: "zoom", playToken: "t1" },
      { idx: 1, title: "b", source: "zoom", playToken: "t2" },
    ] }] }] })).toThrow(/Duplicate lesson idx 1/)
  })

  it("rejects a bad date format", () => {
    expect(() => parseContent({ ...base, tests: [
      { setName: "M1", formUrl: "https://x/viewform", formDate: "15-01-2026" },
    ] })).toThrow(ContentError)
  })

  it("warns on a non-viewform test link and a pdf with no hash", () => {
    const { warnings } = parseContent({
      ...base,
      pdfs: [{ filename: "a.pdf", url: "https://x/a.pdf" }],
      tests: [{ setName: "M1", formUrl: "https://docs.google.com/forms/d/EDIT/edit" }],
    })
    expect(warnings.some((w) => w.includes("viewform"))).toBe(true)
    expect(warnings.some((w) => w.includes("fileHash"))).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- schema`
Expected: FAIL — `Cannot find module './schema'` (file not created yet).

- [ ] **Step 3: Implement the validation layer**

Create `lib/content/schema.ts`:

```ts
import { z } from "zod"
import { EXAM_SLUGS } from "@/lib/exams"

const urlStr = z.string().regex(/^https?:\/\//i, "must be an http(s) URL")
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD")

const lesson = z
  .object({
    idx: z.number().int().positive(),
    title: z.string().min(1),
    source: z.enum(["zoom", "vimeo"]),
    playUrl: urlStr.optional(),
    playToken: z.string().min(1).optional(),
    durationSec: z.number().int().positive().optional(),
    recordedOn: dateStr.optional(),
    sizeBytes: z.number().int().positive().optional(),
  })
  .refine((l) => Boolean(l.playUrl || l.playToken), {
    message: "lesson needs playUrl or playToken",
  })

const subject = z.object({
  name: z.string().min(1),
  teacher: z.string().optional(),
  coverImage: z.string().optional(),
  sort: z.number().int().default(0),
  lessons: z.array(lesson).default([]),
})

const batch = z.object({
  name: z.string().min(1),
  cycle: z.string().optional(),
  sort: z.number().int().default(0),
  thumbnail: z.string().optional(),
  priceInr: z.number().int().nonnegative().optional(),
  description: z.string().optional(),
  subjects: z.array(subject).default([]),
})

const pdf = z.object({
  filename: z.string().min(1),
  url: urlStr,
  fileHash: z.string().optional(),
})
const galleryItem = z.object({ url: urlStr })
const testForm = z.object({
  setName: z.string().min(1),
  timeLimitMin: z.number().int().positive().optional(),
  formUrl: urlStr,
  formDate: dateStr.optional(),
})

export const contentSchema = z.object({
  exam: z.enum(EXAM_SLUGS),
  batches: z.array(batch).default([]),
  pdfs: z.array(pdf).default([]),
  gallery: z.array(galleryItem).default([]),
  tests: z.array(testForm).default([]),
})

export type Content = z.infer<typeof contentSchema>

export class ContentError extends Error {}

/** Validate raw JSON into typed content. Throws ContentError listing every hard
 *  error at once; returns soft warnings alongside the data. */
export function parseContent(raw: unknown): { data: Content; warnings: string[] } {
  const res = contentSchema.safeParse(raw)
  if (!res.success) {
    const msg = res.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n")
    throw new ContentError(`Invalid content file:\n${msg}`)
  }
  const data = res.data

  // Cross-field hard checks zod can't express cleanly.
  for (const b of data.batches) {
    const subjNames = new Set<string>()
    for (const s of b.subjects) {
      if (subjNames.has(s.name))
        throw new ContentError(`Duplicate subject "${s.name}" in batch "${b.name}"`)
      subjNames.add(s.name)
      const idxs = new Set<number>()
      for (const l of s.lessons) {
        if (idxs.has(l.idx))
          throw new ContentError(
            `Duplicate lesson idx ${l.idx} in subject "${s.name}" (batch "${b.name}")`
          )
        idxs.add(l.idx)
      }
    }
  }
  const batchNames = new Set<string>()
  for (const b of data.batches) {
    if (batchNames.has(b.name)) throw new ContentError(`Duplicate batch "${b.name}"`)
    batchNames.add(b.name)
  }

  const warnings: string[] = []
  for (const t of data.tests)
    if (!t.formUrl.includes("/viewform"))
      warnings.push(`test "${t.setName}": formUrl is not a /viewform link`)
  for (const p of data.pdfs)
    if (!p.fileHash) warnings.push(`pdf "${p.filename}": no fileHash, deriving from URL`)

  return { data, warnings }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- schema`
Expected: PASS (all cases in `schema.test.ts`).

- [ ] **Step 5: Commit**

```bash
git add lib/content/schema.ts lib/content/schema.test.ts
git commit -m "feat(content): zod validation layer for import files"
```

---

### Task 3: Loader (idempotent upserts, transactional)

**Files:**
- Create: `lib/content/import.ts`
- Test: `lib/content/import.test.ts`

**Interfaces:**
- Consumes: `Content` from `./schema`; `db` type `PostgresJsDatabase<typeof schema>`; tables from `@/lib/db/schema`.
- Produces: `type ImportResult` (per-table counts); `importContent(db, data: Content): Promise<ImportResult>`. Consumed by Task 4.

- [ ] **Step 1: Write the failing test**

Create `lib/content/import.test.ts` (spins up an in-memory PGlite, migrates, seeds the exam, then imports twice to prove idempotency):

```ts
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
      name: "JULIET", cycle: "AFCAT 1 2027", sort: 0, thumbnail: "/c/j.jpg", priceInr: 2540,
      description: undefined,
      subjects: [
        { name: "Maths", teacher: "AG", coverImage: undefined, sort: 0, lessons: [
          { idx: 1, title: "P1", source: "vimeo", playUrl: "https://player.vimeo.com/video/1" },
          { idx: 2, title: "P2", source: "vimeo", playUrl: "https://player.vimeo.com/video/2" },
        ] },
      ],
    },
  ],
  pdfs: [{ filename: "a.pdf", url: "https://x/a.pdf", fileHash: "h1" }],
  gallery: [{ url: "https://x/1.jpg" }],
  tests: [{ setName: "M1", timeLimitMin: 120, formUrl: "https://x/viewform", formDate: "2026-01-15" }],
}

describe("importContent", () => {
  let db: PostgresJsDatabase<typeof schema>
  beforeEach(async () => { db = await freshDb() })

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

  it("throws if the exam is not seeded", async () => {
    const pg = new PGlite()
    const bare = drizzle(pg, { schema })
    await migrate(bare, { migrationsFolder: "./drizzle" })
    await expect(
      importContent(bare as unknown as PostgresJsDatabase<typeof schema>, content)
    ).rejects.toThrow(/not seeded/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- import`
Expected: FAIL — `Cannot find module './import'`.

- [ ] **Step 3: Implement the loader**

Create `lib/content/import.ts`:

```ts
import { createHash } from "node:crypto"
import { and, eq } from "drizzle-orm"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import * as s from "@/lib/db/schema"
import type { Content } from "./schema"

type Db = PostgresJsDatabase<typeof s>
export type UpsertCount = { inserted: number; updated: number }
export type SkipCount = { inserted: number; skipped: number }
export type ImportResult = {
  batches: UpsertCount
  subjects: UpsertCount
  lessons: UpsertCount
  pdfs: SkipCount
  gallery: SkipCount
  tests: UpsertCount
}

const sha = (v: string) => createHash("sha256").update(v).digest("hex")

export async function importContent(db: Db, data: Content): Promise<ImportResult> {
  const exam = await db.query.exams.findFirst({ where: eq(s.exams.slug, data.exam) })
  if (!exam) throw new Error(`Exam "${data.exam}" not seeded — run \`npm run db:seed\` first`)
  const examId = exam.id

  const r: ImportResult = {
    batches: { inserted: 0, updated: 0 },
    subjects: { inserted: 0, updated: 0 },
    lessons: { inserted: 0, updated: 0 },
    pdfs: { inserted: 0, skipped: 0 },
    gallery: { inserted: 0, skipped: 0 },
    tests: { inserted: 0, updated: 0 },
  }

  await db.transaction(async (tx) => {
    for (const b of data.batches) {
      const bvals = {
        cycle: b.cycle ?? null,
        sort: b.sort,
        thumbnail: b.thumbnail ?? null,
        priceInr: b.priceInr ?? null,
        description: b.description ?? null,
      }
      const eb = await tx.query.batches.findFirst({
        where: and(eq(s.batches.examId, examId), eq(s.batches.name, b.name)),
      })
      let batchId: string
      if (eb) {
        await tx.update(s.batches).set(bvals).where(eq(s.batches.id, eb.id))
        batchId = eb.id
        r.batches.updated++
      } else {
        const [row] = await tx
          .insert(s.batches)
          .values({ examId, name: b.name, ...bvals })
          .returning()
        batchId = row.id
        r.batches.inserted++
      }

      for (const su of b.subjects) {
        const svals = { teacher: su.teacher ?? null, coverImage: su.coverImage ?? null, sort: su.sort }
        const es = await tx.query.subjects.findFirst({
          where: and(eq(s.subjects.batchId, batchId), eq(s.subjects.name, su.name)),
        })
        let subjectId: string
        if (es) {
          await tx.update(s.subjects).set(svals).where(eq(s.subjects.id, es.id))
          subjectId = es.id
          r.subjects.updated++
        } else {
          const [row] = await tx
            .insert(s.subjects)
            .values({ batchId, name: su.name, ...svals })
            .returning()
          subjectId = row.id
          r.subjects.inserted++
        }

        for (const l of su.lessons) {
          const lvals = {
            title: l.title,
            source: l.source,
            playUrl: l.playUrl ?? null,
            playToken: l.playToken ?? null,
            durationSec: l.durationSec ?? null,
            recordedOn: l.recordedOn ?? null,
            sizeBytes: l.sizeBytes ?? null,
          }
          const el = await tx.query.lessons.findFirst({
            where: and(eq(s.lessons.subjectId, subjectId), eq(s.lessons.idx, l.idx)),
          })
          if (el) {
            await tx.update(s.lessons).set(lvals).where(eq(s.lessons.id, el.id))
            r.lessons.updated++
          } else {
            await tx.insert(s.lessons).values({ subjectId, idx: l.idx, ...lvals })
            r.lessons.inserted++
          }
        }
      }
    }

    for (const p of data.pdfs) {
      const fileHash = p.fileHash ?? sha(p.url)
      const res = await tx
        .insert(s.pdfs)
        .values({ examId, filename: p.filename, url: p.url, fileHash })
        .onConflictDoNothing({ target: [s.pdfs.examId, s.pdfs.fileHash] })
        .returning()
      res.length ? r.pdfs.inserted++ : r.pdfs.skipped++
    }

    for (const g of data.gallery) {
      const res = await tx
        .insert(s.galleryImages)
        .values({ examId, url: g.url })
        .onConflictDoNothing({ target: [s.galleryImages.examId, s.galleryImages.url] })
        .returning()
      res.length ? r.gallery.inserted++ : r.gallery.skipped++
    }

    for (const t of data.tests) {
      const tvals = {
        timeLimitMin: t.timeLimitMin ?? null,
        formUrl: t.formUrl,
        formDate: t.formDate ?? null,
      }
      const et = await tx.query.testForms.findFirst({
        where: and(eq(s.testForms.examId, examId), eq(s.testForms.setName, t.setName)),
      })
      if (et) {
        await tx.update(s.testForms).set(tvals).where(eq(s.testForms.id, et.id))
        r.tests.updated++
      } else {
        await tx.insert(s.testForms).values({ examId, setName: t.setName, ...tvals })
        r.tests.inserted++
      }
    }
  })

  return r
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- import`
Expected: PASS (all cases). If PGlite migrate complains about a missing `./drizzle`, confirm cwd is the project root.

- [ ] **Step 5: Commit**

```bash
git add lib/content/import.ts lib/content/import.test.ts
git commit -m "feat(content): idempotent transactional loader"
```

---

### Task 4: CLI + npm script + sample + manual verification

**Files:**
- Create: `scripts/import-content.mts`
- Create: `docs/superpowers/samples/afcat-sample.json`
- Modify: `package.json` (scripts)

**Interfaces:**
- Consumes: `parseContent` (Task 2), `importContent` (Task 3), `db` from `@/lib/db`.
- Produces: `npm run db:import <file.json> [-- --dry]`.

- [ ] **Step 1: Write the CLI**

Create `scripts/import-content.mts`:

```ts
/**
 * Content importer CLI. Loads one JSON-per-exam file into the DB (see
 * docs/superpowers/specs/2026-08-13-content-importer-design.md).
 *
 *   npm run db:import path/to/afcat.json            # load (uses .env DATABASE_URL)
 *   npm run db:import path/to/afcat.json -- --dry   # validate + report only
 *
 * Offline test against the PGlite dev DB:
 *   DATABASE_URL=pglite://.pglite node --import tsx scripts/import-content.mts sample.json
 */
import { readFileSync } from "node:fs"
import { parseContent, ContentError } from "../lib/content/schema"
import { importContent } from "../lib/content/import"

const file = process.argv[2]
const dry = process.argv.includes("--dry")
if (!file) {
  console.error("usage: db:import <file.json> [-- --dry]")
  process.exit(1)
}

let parsed
try {
  const raw = JSON.parse(readFileSync(file, "utf8"))
  parsed = parseContent(raw)
} catch (e) {
  console.error(e instanceof ContentError ? e.message : `Cannot read/parse ${file}: ${(e as Error).message}`)
  process.exit(1)
}

for (const w of parsed.warnings) console.warn("warn:", w)

const counts = {
  batches: parsed.data.batches.length,
  subjects: parsed.data.batches.reduce((n, b) => n + b.subjects.length, 0),
  lessons: parsed.data.batches.reduce((n, b) => n + b.subjects.reduce((m, s) => m + s.lessons.length, 0), 0),
  pdfs: parsed.data.pdfs.length,
  gallery: parsed.data.gallery.length,
  tests: parsed.data.tests.length,
}

if (dry) {
  console.log(`dry run for exam "${parsed.data.exam}" — would load:`, counts)
  process.exit(0)
}

// Import db lazily so --dry never opens a DB connection.
const { db } = await import("../lib/db")
const result = await importContent(db, parsed.data)
console.log(`imported into exam "${parsed.data.exam}":`, result)
process.exit(0)
```

- [ ] **Step 2: Add the npm script**

In `package.json` `scripts`, add after `db:local`:

```json
    "db:import": "node --env-file=.env --import tsx scripts/import-content.mts"
```

- [ ] **Step 3: Create a sample file**

Create `docs/superpowers/samples/afcat-sample.json`:

```json
{
  "exam": "afcat",
  "batches": [
    {
      "name": "SAMPLE BATCH (AFCAT 1 2027)",
      "cycle": "AFCAT 1 2027",
      "priceInr": 2540,
      "subjects": [
        {
          "name": "Maths",
          "teacher": "Sample Teacher",
          "lessons": [
            { "idx": 1, "title": "Percentage Class 1", "source": "vimeo", "playUrl": "https://player.vimeo.com/video/76979871", "durationSec": 1830 },
            { "idx": 2, "title": "Percentage Class 2", "source": "vimeo", "playUrl": "https://player.vimeo.com/video/76979871" }
          ]
        }
      ]
    }
  ],
  "pdfs": [{ "filename": "Sample formula sheet.pdf", "url": "https://example.com/sample.pdf" }],
  "gallery": [{ "url": "https://picsum.photos/seed/gf1/600" }],
  "tests": [{ "setName": "Sample Mock 1", "timeLimitMin": 120, "formUrl": "https://docs.google.com/forms/d/e/EXAMPLE/viewform" }]
}
```

- [ ] **Step 4: Manual verification — dry run**

Run: `npm run db:import docs/superpowers/samples/afcat-sample.json -- --dry`
Expected: prints `warn: pdf "Sample formula sheet.pdf": no fileHash, deriving from URL` and `dry run for exam "afcat" — would load: { batches: 1, subjects: 1, lessons: 2, pdfs: 1, gallery: 1, tests: 1 }`. No DB touched.

- [ ] **Step 5: Manual verification — real load against offline PGlite, idempotent**

```bash
rm -rf .pglite && npm run db:local
DATABASE_URL=pglite://.pglite node --import tsx scripts/import-content.mts docs/superpowers/samples/afcat-sample.json
DATABASE_URL=pglite://.pglite node --import tsx scripts/import-content.mts docs/superpowers/samples/afcat-sample.json
```
Expected: first run reports `batches: { inserted: 1 ... }`, `lessons: { inserted: 2 ... }`; second run reports `inserted: 0` with `updated`/`skipped` matching. Then start the app (`DATABASE_URL=pglite://.pglite npm run dev -- -p 3007`), sign in with the AFCAT dev cookie, and confirm the sample batch/subject/lessons + PDF/gallery/test render.

- [ ] **Step 6: Commit**

```bash
git add scripts/import-content.mts package.json docs/superpowers/samples/afcat-sample.json
git commit -m "feat(content): db:import CLI + sample + dry-run"
```

---

## Self-Review

**Spec coverage:** file format → Task 2 zod schema; schema changes → Task 1; idempotent upserts (batch/subject/lesson find-then-upsert, pdf/gallery skip, test upsert) → Task 3; validation hard errors + warnings → Task 2; `--dry` + one-transaction load + CLI + `db:import` → Tasks 3/4; unit-tested pure layer → Task 2; PDF hash fallback → Task 3. All spec sections map to a task.

**Placeholder scan:** no TBD/TODO; every code step has real code; test steps have real assertions.

**Type consistency:** `parseContent` returns `{data, warnings}` (Task 2) — consumed with those names in Tasks 3/4. `importContent(db, data)` returns `ImportResult` with `{inserted,updated}` / `{inserted,skipped}` shapes — asserted with those exact keys in Task 3's test and printed in Task 4. `Db = PostgresJsDatabase<typeof s>` matches the cast used in the loader test. Unique-key targets in Task 3 (`[examId,name]`, `[batchId,name]`, `[examId,fileHash]`, `[examId,url]`, `[examId,setName]`) match the constraints added in Task 1.
