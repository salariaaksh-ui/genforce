/**
 * Offline-dev seeder for the embedded PGlite database (see lib/db/index.ts).
 * Zero install, no server: opens the ./.pglite data dir in-process, applies
 * migrations, and seeds exams + demo AFCAT content + two dev sign-in sessions,
 * then closes. Run BEFORE `next dev` (they can't hold the dir at the same time).
 *
 *   npm run db:local          # seed ./.pglite
 *   DATABASE_URL=pglite://.pglite npm run dev -- -p 3007
 *
 * "Sign in" during verification by setting a cookie on http://localhost:3007:
 *   document.cookie = "authjs.session-token=dev-session-afcat; path=/"  # populated
 *   document.cookie = "authjs.session-token=dev-session-nda; path=/"    # empty states
 *
 * Local verification only — not for production.
 */
import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { eq } from "drizzle-orm"
import * as s from "../lib/db/schema"
import { EXAM_SLUGS, EXAM_LABEL } from "../lib/exams"

const DIR = process.argv[2] || ".pglite"
const pg = await PGlite.create(DIR)
const db = drizzle(pg, { schema: s })
await migrate(db, { migrationsFolder: "./drizzle" })

for (const slug of EXAM_SLUGS) {
  await db.insert(s.exams).values({ slug, name: EXAM_LABEL[slug] }).onConflictDoNothing({ target: s.exams.slug })
}
const afcat = (await db.query.exams.findFirst({ where: eq(s.exams.slug, "afcat") }))!
const nda = (await db.query.exams.findFirst({ where: eq(s.exams.slug, "nda") }))!
const capf = (await db.query.exams.findFirst({ where: eq(s.exams.slug, "capf") }))!

// Demo content for AFCAT only — so NDA verifies the empty states (day-one UX).
const hasBatch = await db.query.batches.findFirst({ where: eq(s.batches.examId, afcat.id) })
if (!hasBatch) {
  const VIDEO = "https://player.vimeo.com/video/76979871"
  const [batch] = await db.insert(s.batches)
    .values({ examId: afcat.id, name: "DEMO Batch — 2026 Cycle", cycle: "Jan 2026", sort: 0 }).returning()
  const subs = await db.insert(s.subjects).values([
    { batchId: batch.id, name: "Physics", teacher: "Sqn Ldr A. Rao", sort: 0 },
    { batchId: batch.id, name: "Reasoning", teacher: "Wg Cdr S. Nair", sort: 1 },
  ]).returning()
  await db.insert(s.lessons).values([
    { subjectId: subs[0].id, idx: 1, title: "Kinematics — the basics", source: "vimeo", playUrl: VIDEO, durationSec: 1830 },
    { subjectId: subs[0].id, idx: 2, title: "Newton's laws of motion", source: "vimeo", playUrl: VIDEO, durationSec: 2400 },
    { subjectId: subs[1].id, idx: 1, title: "Series & sequences", source: "vimeo", playUrl: VIDEO, durationSec: 1500 },
  ])
  await db.insert(s.pdfs).values([
    { examId: afcat.id, filename: "DEMO — Physics formula sheet.pdf", url: "https://example.com/demo-1.pdf", fileHash: "demo-hash-1" },
    { examId: afcat.id, filename: "DEMO — Reasoning practice set.pdf", url: "https://example.com/demo-2.pdf", fileHash: "demo-hash-2" },
  ]).onConflictDoNothing()
  await db.insert(s.galleryImages).values([
    { examId: afcat.id, url: "https://picsum.photos/seed/gf1/600" },
    { examId: afcat.id, url: "https://picsum.photos/seed/gf2/600" },
    { examId: afcat.id, url: "https://picsum.photos/seed/gf3/600" },
  ])
  await db.insert(s.testForms).values([
    { examId: afcat.id, setName: "DEMO Mock Test 1", timeLimitMin: 120, formUrl: "https://docs.google.com/forms/d/e/EXAMPLE/viewform", formDate: "2026-01-15" },
  ])
}

// Two dev sign-in sessions: one on populated AFCAT, one on empty NDA.
async function ensureSession(email: string, name: string, examId: string, token: string) {
  let u = await db.query.users.findFirst({ where: eq(s.users.email, email) })
  if (!u) [u] = await db.insert(s.users).values({ email, name, activeExamId: examId }).returning()
  else await db.update(s.users).set({ activeExamId: examId }).where(eq(s.users.id, u.id))
  await db.insert(s.accounts)
    .values({ userId: u.id, type: "oidc", provider: "google", providerAccountId: email })
    .onConflictDoNothing()
  const expires = new Date(Date.now() + 30 * 864e5)
  await db.insert(s.sessions).values({ sessionToken: token, userId: u.id, expires }).onConflictDoNothing()
}
await ensureSession("dev-afcat@example.com", "Dev Student (AFCAT)", afcat.id, "dev-session-afcat")
await ensureSession("dev-nda@example.com", "Dev Student (NDA)", nda.id, "dev-session-nda")
await ensureSession("dev-capf@example.com", "Dev Student (CAPF)", capf.id, "dev-session-capf")

// A user with NO active exam, to reach /onboarding (dev-session-onboard).
{
  let u = await db.query.users.findFirst({ where: eq(s.users.email, "dev-onboard@example.com") })
  if (!u) [u] = await db.insert(s.users).values({ email: "dev-onboard@example.com", name: "Dev Student (new)" }).returning()
  else await db.update(s.users).set({ activeExamId: null }).where(eq(s.users.id, u.id))
  await db.insert(s.accounts).values({ userId: u.id, type: "oidc", provider: "google", providerAccountId: "dev-onboard@example.com" }).onConflictDoNothing()
  await db.insert(s.sessions).values({ sessionToken: "dev-session-onboard", userId: u.id, expires: new Date(Date.now() + 30 * 864e5) }).onConflictDoNothing()
}

await pg.close()
console.log(`seeded ${DIR}: exams + AFCAT demo + dev sessions (dev-session-afcat / dev-session-nda)`)
process.exit(0)
