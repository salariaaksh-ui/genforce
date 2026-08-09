# Genforce Foundation + Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take a logged-out visitor through Google sign-in to a working (empty) Genforce dashboard, on a clean LMS scaffold with a Postgres data model.

**Architecture:** Full-stack Next.js 16 (App Router). Auth.js v5 with the Google provider handles login; a Drizzle adapter persists users/sessions to Postgres. Middleware guards private routes. A first-run onboarding step records the user's chosen exam; the dashboard, exam switcher, and profile read/write that state. All domain tables are created now; only the auth/exam/plan tables are exercised this phase.

**Tech Stack:** Next.js 16, TypeScript, Tailwind 4 + shadcn/ui, PostgreSQL, Drizzle ORM (`drizzle-orm`/`drizzle-kit`, `postgres` driver), Auth.js (`next-auth@beta`) + `@auth/drizzle-adapter`, Vitest for unit tests.

## Global Constraints

- **Next.js 16 is not the Next.js in training data.** Before writing any route handler, `middleware.ts`, server action, or `next.config` change, read the relevant guide under `node_modules/next/dist/docs/` and heed deprecations. (From `AGENTS.md`.)
- **Auth.js v5 (`next-auth@beta`)** — API differs from NextAuth v4. Config lives in a root `auth.ts` exporting `{ handlers, auth, signIn, signOut }`.
- **Auth = Google only.** No password, no OTP, no SMS, no email verification.
- **Exam set is fixed:** `afcat`, `nda`, `cds`, `capf` (slugs) → `AFCAT`, `NDA`, `CDS`, `CAPF` (names).
- **Design out nexield's flaws:** no unskippable welcome popup; no hardcoded stats; PDF/test tables carry dedupe/URL constraints from creation.
- **Brand identity is a placeholder** (`Genforce`) until the design-DNA pass; do not invent a logo/palette here — use neutral shadcn defaults.
- **Package manager:** npm. **Node:** ≥ 20.
- Frequent commits: one per task minimum.

---

## File structure (created/modified this phase)

```
auth.ts                              # Auth.js v5 config (Google + Drizzle adapter)
middleware.ts                        # route protection
drizzle.config.ts                    # drizzle-kit config
vitest.config.ts                     # test runner
.env.example / .env                  # DATABASE_URL, AUTH_* keys
lib/db/schema.ts                     # all Drizzle tables
lib/db/index.ts                      # Drizzle client
lib/db/seed.ts                       # seed 4 exams
lib/auth/guards.ts                   # requireUser, needsOnboarding
lib/exams.ts                         # EXAM_SLUGS, isExamSlug, exam labels
lib/validation.ts                    # normalizePhone (pure)
app/actions/exam.ts                  # selectExam server action
app/actions/profile.ts              # updatePhone server action
app/(marketing)/page.tsx             # logged-out landing (also handles logged-in redirect)
app/login/page.tsx                   # Google sign-in
app/onboarding/page.tsx              # first-run exam pick
app/(app)/layout.tsx                 # authed shell (top bar)
app/(app)/dashboard/page.tsx         # dashboard body
app/profile/page.tsx                 # profile + plans + logout
components/app/top-bar.tsx           # logo, user, exam chip, bell stub, account
components/app/exam-switcher.tsx     # modal → selectExam
components/auth/google-button.tsx    # sign-in button
app/robots.ts / app/sitemap.ts       # regenerated for LMS
tests/*.test.ts                      # Vitest unit tests
```

Removed (real-estate): `app/listings/**`, `app/about`, `app/contact`, `components/listings/**`, `components/map-embed-slot.tsx`, `components/inquiry-form.tsx`, `lib/sample-listings.ts`, real-estate `lib/types.ts`, old `app/page.tsx` body, `app/api/contact`.

---

### Task 0: Re-scaffold — strip real estate, add deps, wire Vitest

**Files:**
- Delete: `app/listings/`, `app/about/`, `app/contact/`, `app/api/contact/`, `components/listings/`, `components/map-embed-slot.tsx`, `components/inquiry-form.tsx`, `lib/sample-listings.ts`
- Modify: `app/page.tsx` (temporary placeholder), `lib/types.ts` (empty domain types), `package.json`
- Create: `vitest.config.ts`, `tests/smoke.test.ts`

**Interfaces:**
- Produces: a booting Next app with no real-estate routes; `npx vitest run` available.

- [ ] **Step 1: Read the Next 16 docs index** — `node_modules/next/dist/docs/` (routing, middleware, server-actions). Note anything that contradicts assumptions below.

- [ ] **Step 2: Delete real-estate files**

```bash
cd "C:/Ai kaarigar/clients/genforce"
rm -rf app/listings app/about app/contact app/api/contact components/listings components/map-embed-slot.tsx components/inquiry-form.tsx lib/sample-listings.ts
```

- [ ] **Step 3: Replace `app/page.tsx` with a temporary placeholder**

```tsx
export default function Home() {
  return <main className="p-8"><h1 className="text-2xl font-semibold">Genforce</h1></main>;
}
```

- [ ] **Step 4: Empty domain types** — set `lib/types.ts` to `export {};` (real-estate types removed; domain types come from Drizzle `$inferSelect` later).

- [ ] **Step 5: Install dependencies**

```bash
npm install drizzle-orm postgres next-auth@beta @auth/drizzle-adapter
npm install -D drizzle-kit vitest @types/node
```

- [ ] **Step 6: Add Vitest config** — `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
```

- [ ] **Step 7: Add test script** — in `package.json` `"scripts"` add `"test": "vitest run"`.

- [ ] **Step 8: Write a smoke test** — `tests/smoke.test.ts`

```ts
import { expect, test } from "vitest";
test("test runner works", () => { expect(1 + 1).toBe(2); });
```

- [ ] **Step 9: Run tests — expect PASS**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 10: Boot the dev server — expect clean**

Run: `npm run dev -- -p 3007` (then open http://localhost:3007 in the browser preview).
Expected: "Genforce" placeholder renders, no console errors, no 404s for removed routes linked from anywhere.

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "chore: strip real-estate scaffold, add drizzle/auth/vitest deps"
```

---

### Task 1: Postgres schema, migrations, exam seed

**Files:**
- Create: `lib/db/schema.ts`, `lib/db/index.ts`, `lib/db/seed.ts`, `drizzle.config.ts`, `lib/exams.ts`, `.env.example`, `.env`, `tests/exams.test.ts`
- Modify: `package.json` (db scripts)

**Interfaces:**
- Produces:
  - `db` (Drizzle client) from `lib/db/index.ts`
  - tables `users, accounts, sessions, verificationTokens, exams, plans, batches, subjects, lessons, pdfs, galleryImages, testForms` from `lib/db/schema.ts`
  - `EXAM_SLUGS: readonly ["afcat","nda","cds","capf"]`, `isExamSlug(s: string): s is ExamSlug`, `EXAM_LABEL: Record<ExamSlug,string>` from `lib/exams.ts`
  - `seed()` inserting the 4 exams idempotently from `lib/db/seed.ts`

- [ ] **Step 1: Provision a dev Postgres** (skip if you already have one)

```bash
docker run -d --name genforce-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=genforce -p 5432:5432 postgres:16
```

- [ ] **Step 2: Add env files** — `.env.example` (committed) and `.env` (gitignored) with:

```
DATABASE_URL=postgres://postgres:dev@localhost:5432/genforce
AUTH_SECRET=dev-secret-change-me
AUTH_GOOGLE_ID=placeholder
AUTH_GOOGLE_SECRET=placeholder
NEXT_PUBLIC_SITE_URL=http://localhost:3007
```

- [ ] **Step 3: Write `lib/exams.ts`**

```ts
export const EXAM_SLUGS = ["afcat", "nda", "cds", "capf"] as const;
export type ExamSlug = (typeof EXAM_SLUGS)[number];
export const EXAM_LABEL: Record<ExamSlug, string> = {
  afcat: "AFCAT", nda: "NDA", cds: "CDS", capf: "CAPF",
};
export function isExamSlug(s: string): s is ExamSlug {
  return (EXAM_SLUGS as readonly string[]).includes(s);
}
```

- [ ] **Step 4: Write the failing exam-slug test** — `tests/exams.test.ts`

```ts
import { expect, test } from "vitest";
import { isExamSlug, EXAM_LABEL } from "../lib/exams";
test("valid slugs accepted", () => {
  expect(isExamSlug("afcat")).toBe(true);
  expect(isExamSlug("capf")).toBe(true);
});
test("invalid slugs rejected", () => {
  expect(isExamSlug("gate")).toBe(false);
  expect(isExamSlug("")).toBe(false);
});
test("every slug has a label", () => {
  expect(EXAM_LABEL.afcat).toBe("AFCAT");
  expect(EXAM_LABEL.nda).toBe("NDA");
});
```

- [ ] **Step 5: Run — expect PASS** (`lib/exams.ts` already written)

Run: `npm test -- exams`
Expected: 3 passed.

- [ ] **Step 6: Write `lib/db/schema.ts`** — Auth.js tables match `@auth/drizzle-adapter` Postgres shape; domain tables per spec §3.

```ts
import { pgTable, text, timestamp, uuid, integer, bigint, date, primaryKey, unique } from "drizzle-orm/pg-core";

export const exams = pgTable("exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  phone: text("phone"),
  activeExamId: uuid("active_exam_id").references(() => exams.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (t) => ({ pk: primaryKey({ columns: [t.provider, t.providerAccountId] }) }));

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.identifier, t.token] }) }));

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  examId: uuid("exam_id").notNull().references(() => exams.id),
  status: text("status").notNull().default("none"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({ userExam: unique().on(t.userId, t.examId) }));

export const batches = pgTable("batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  cycle: text("cycle"),
  sort: integer("sort").default(0).notNull(),
});

export const subjects = pgTable("subjects", {
  id: uuid("id").defaultRandom().primaryKey(),
  batchId: uuid("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  teacher: text("teacher"),
  coverImage: text("cover_image"),
  sort: integer("sort").default(0).notNull(),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectId: uuid("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  idx: integer("idx").notNull(),
  title: text("title").notNull(),
  source: text("source").notNull(), // zoom | vimeo
  playToken: text("play_token"),
  playUrl: text("play_url"),
  durationSec: integer("duration_sec"),
  recordedOn: date("recorded_on"),
  sizeBytes: bigint("size_bytes", { mode: "number" }),
}, (t) => ({ subjIdx: unique().on(t.subjectId, t.idx) }));

export const pdfs = pgTable("pdfs", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  fileHash: text("file_hash").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
}, (t) => ({ examHash: unique().on(t.examId, t.fileHash) }));

export const galleryImages = pgTable("gallery_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testForms = pgTable("test_forms", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  setName: text("set_name"),
  timeLimitMin: integer("time_limit_min"),
  formUrl: text("form_url").notNull(),
  formDate: date("form_date"),
});
```

- [ ] **Step 7: Write `lib/db/index.ts`**

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
export const db = drizzle(client, { schema });
```

- [ ] **Step 8: Write `drizzle.config.ts`**

```ts
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

- [ ] **Step 9: Add db scripts** — `package.json` `"scripts"`: `"db:generate": "drizzle-kit generate"`, `"db:migrate": "drizzle-kit migrate"`, `"db:seed": "node --env-file=.env lib/db/seed.ts"` (Node 20 `--env-file`; if the runtime rejects TS, run via `npx tsx lib/db/seed.ts` — add `tsx` as devDep in that case).

- [ ] **Step 10: Generate + apply migration**

```bash
npm run db:generate
npm run db:migrate
```
Expected: a migration in `drizzle/`, tables created in Postgres.

- [ ] **Step 11: Write `lib/db/seed.ts`** (idempotent)

```ts
import { db } from "./index";
import { exams } from "./schema";
import { EXAM_SLUGS, EXAM_LABEL } from "../exams";

export async function seed() {
  for (const slug of EXAM_SLUGS) {
    await db.insert(exams).values({ slug, name: EXAM_LABEL[slug] })
      .onConflictDoNothing({ target: exams.slug });
  }
}
seed().then(() => { console.log("seeded"); process.exit(0); });
```

- [ ] **Step 12: Seed + verify 4 exams**

```bash
npm run db:seed
```
Then confirm: `docker exec genforce-pg psql -U postgres -d genforce -c "select count(*) from exams;"` → **4**. Run seed again → still 4 (idempotent).

- [ ] **Step 13: Commit**

```bash
git add -A && git commit -m "feat: postgres schema, migrations, exam seed"
```

---

### Task 2: Auth.js Google provider + Drizzle adapter

**Files:**
- Create: `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `components/auth/google-button.tsx`
- Test: manual integration (dev server)

**Interfaces:**
- Produces: `auth()`, `signIn()`, `signOut()`, `handlers` from `auth.ts`. `auth()` returns a session with `session.user.id` (uuid), `.name`, `.email`, `.image`.

- [ ] **Step 1: Read** `node_modules/next-auth/` README/docs and the Drizzle adapter usage in `node_modules/@auth/drizzle-adapter/`. Confirm the v5 config shape and adapter table-name expectations against Task 1's schema; adjust column names only if the installed adapter disagrees.

- [ ] **Step 2: Write `auth.ts`**

```ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users, accountsTable: accounts,
    sessionsTable: sessions, verificationTokensTable: verificationTokens,
  }),
  providers: [Google],
  session: { strategy: "database" },
  pages: { signIn: "/login" },
});
```

- [ ] **Step 3: Write the route handler** — `app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 4: Write the sign-in button** — `components/auth/google-button.tsx`

```tsx
import { signIn } from "@/auth";

export function GoogleButton() {
  return (
    <form action={async () => { "use server"; await signIn("google", { redirectTo: "/" }); }}>
      <button type="submit" className="rounded-md border px-4 py-2 font-medium">
        Sign in with Google
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Verify providers endpoint** — start dev server, then:

Run: `curl -s http://localhost:3007/api/auth/providers`
Expected: JSON containing a `google` provider. (Full OAuth loop needs real `AUTH_GOOGLE_ID/SECRET` from the client — with placeholders the provider still registers; note this in the commit.)

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: auth.js google provider + drizzle adapter"
```

---

### Task 3: Landing + login pages + SEO basics

**Files:**
- Create: `app/(marketing)/page.tsx` (replaces temp `app/page.tsx`), `app/login/page.tsx`, `app/robots.ts`, `app/sitemap.ts`
- Delete: temporary `app/page.tsx` from Task 0 (moved into the `(marketing)` group)

**Interfaces:**
- Consumes: `auth()` from `auth.ts`, `GoogleButton` from Task 2.
- Produces: logged-out landing at `/`; logged-in `/` redirects to `/dashboard`. `/login` page.

- [ ] **Step 1: Move home into a route group** — create `app/(marketing)/page.tsx`, delete the temp `app/page.tsx`.

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GoogleButton } from "@/components/auth/google-button";

export default async function Landing() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Genforce</h1>
      <p className="text-muted-foreground">Exam prep for AFCAT, NDA, CDS &amp; CAPF.</p>
      <GoogleButton />
    </main>
  );
}
```

- [ ] **Step 2: Write `/login`** — `app/login/page.tsx`

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GoogleButton } from "@/components/auth/google-button";

export default async function Login() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <GoogleButton />
    </main>
  );
}
```

- [ ] **Step 3: Regenerate `app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3007";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/profile", "/dashboard", "/onboarding", "/api/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
```

- [ ] **Step 4: Regenerate `app/sitemap.ts`** (public routes only)

```ts
import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3007";
  return [{ url: `${base}/`, priority: 1 }, { url: `${base}/login`, priority: 0.5 }];
}
```

- [ ] **Step 5: Verify** — dev server + browser preview:
  - `/` (logged out) renders "Genforce" + Google button, no console errors.
  - `curl -s http://localhost:3007/robots.txt` disallows `/profile`, `/dashboard`.
  - `curl -s http://localhost:3007/sitemap.xml` returns the two public URLs.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: landing + login pages, robots/sitemap"
```

---

### Task 4: Middleware route protection

**Files:**
- Create: `middleware.ts`
- Test: integration (dev server)

**Interfaces:**
- Consumes: `auth` from `auth.ts`.
- Produces: private routes (`/dashboard`, `/onboarding`, `/profile`) redirect to `/login` when unauthenticated.

- [ ] **Step 1: Read** `node_modules/next/dist/docs/` middleware guide (matcher syntax, Edge constraints).

- [ ] **Step 2: Write `middleware.ts`**

```ts
import { auth } from "@/auth";

export default auth((req) => {
  const isAuthed = !!req.auth?.user;
  if (!isAuthed) {
    const url = new URL("/login", req.nextUrl.origin);
    return Response.redirect(url);
  }
});

export const config = { matcher: ["/dashboard/:path*", "/onboarding/:path*", "/profile/:path*"] };
```

- [ ] **Step 3: Verify redirect (logged out)**

Run: `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3007/profile`
Expected: `307`/`302` to `/login`. Confirm `/` still returns `200`.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: middleware protects private routes"
```

---

### Task 5: Onboarding gate + selectExam action

**Files:**
- Create: `lib/auth/guards.ts`, `app/actions/exam.ts`, `app/onboarding/page.tsx`, `tests/guards.test.ts`

**Interfaces:**
- Consumes: `auth()`, `db`, `exams`/`users` tables, `isExamSlug`.
- Produces:
  - `needsOnboarding(user: { activeExamId: string | null }): boolean` from `lib/auth/guards.ts`
  - `requireUser(): Promise<SessionUser>` (redirects to `/login` if absent) from `lib/auth/guards.ts`
  - `selectExam(slug: string): Promise<void>` server action from `app/actions/exam.ts` — validates slug, sets `users.activeExamId`, redirects to `/dashboard`.

- [ ] **Step 1: Write the failing guard test** — `tests/guards.test.ts`

```ts
import { expect, test } from "vitest";
import { needsOnboarding } from "../lib/auth/guards";
test("null active exam needs onboarding", () => {
  expect(needsOnboarding({ activeExamId: null })).toBe(true);
});
test("set active exam does not", () => {
  expect(needsOnboarding({ activeExamId: "abc" })).toBe(false);
});
```

- [ ] **Step 2: Run — expect FAIL** (`needsOnboarding` not defined)

Run: `npm test -- guards`
Expected: FAIL, module/function not found.

- [ ] **Step 3: Write `lib/auth/guards.ts`**

```ts
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export function needsOnboarding(user: { activeExamId: string | null }): boolean {
  return user.activeExamId === null;
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `npm test -- guards`
Expected: 2 passed.

- [ ] **Step 5: Write `app/actions/exam.ts`**

```ts
"use server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, exams } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { isExamSlug } from "@/lib/exams";

export async function selectExam(slug: string) {
  if (!isExamSlug(slug)) throw new Error("invalid exam");
  const user = await requireUser();
  const exam = await db.query.exams.findFirst({ where: eq(exams.slug, slug) });
  if (!exam) throw new Error("exam not found");
  await db.update(users).set({ activeExamId: exam.id }).where(eq(users.id, user.id));
  redirect("/dashboard");
}
```

- [ ] **Step 6: Write `app/onboarding/page.tsx`**

```tsx
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { needsOnboarding } from "@/lib/auth/guards";
import { selectExam } from "@/app/actions/exam";
import { EXAM_SLUGS, EXAM_LABEL } from "@/lib/exams";

export default async function Onboarding() {
  const sessionUser = await requireUser();
  const row = await db.query.users.findFirst({ where: eq(users.id, sessionUser.id) });
  if (row && !needsOnboarding({ activeExamId: row.activeExamId })) redirect("/dashboard");
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Choose your exam</h1>
      <div className="grid grid-cols-2 gap-3">
        {EXAM_SLUGS.map((slug) => (
          <form key={slug} action={selectExam.bind(null, slug)}>
            <button type="submit" className="w-full rounded-md border p-4 font-medium hover:bg-accent">
              {EXAM_LABEL[slug]}
            </button>
          </form>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: onboarding gate + selectExam action"
```

---

### Task 6: Dashboard shell — top bar, exam switcher, body

**Files:**
- Create: `app/(app)/layout.tsx`, `app/(app)/dashboard/page.tsx`, `components/app/top-bar.tsx`, `components/app/exam-switcher.tsx`

**Interfaces:**
- Consumes: `requireUser`, `needsOnboarding`, `db`, `selectExam`, `EXAM_LABEL`, `batches` table.
- Produces: authed shell + dashboard at `/dashboard`; exam switcher calls `selectExam`.

- [ ] **Step 1: Write `app/(app)/layout.tsx`** (auth + onboarding gate around all app pages)

```tsx
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireUser, needsOnboarding } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { TopBar } from "@/components/app/top-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await requireUser();
  const row = await db.query.users.findFirst({ where: eq(users.id, sessionUser.id) });
  if (!row || needsOnboarding({ activeExamId: row.activeExamId })) redirect("/onboarding");
  return (
    <div className="min-h-dvh">
      <TopBar userName={row.name ?? "Student"} activeExamId={row.activeExamId!} />
      <main id="main-content" className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Write `components/app/top-bar.tsx`**

```tsx
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { exams } from "@/lib/db/schema";
import { ExamSwitcher } from "./exam-switcher";

export async function TopBar({ userName, activeExamId }: { userName: string; activeExamId: string }) {
  const exam = await db.query.exams.findFirst({ where: eq(exams.id, activeExamId) });
  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <Link href="/dashboard" className="text-lg font-semibold">Genforce</Link>
      <div className="flex items-center gap-3">
        <ExamSwitcher currentLabel={exam?.name ?? "Exam"} />
        <button aria-label="Notifications" className="rounded-md border px-2 py-1" disabled title="No notifications">🔔</button>
        <Link href="/profile" aria-label="Account" className="rounded-md border px-2 py-1">{userName[0]?.toUpperCase()}</Link>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Write `components/app/exam-switcher.tsx`** (client modal → server action)

```tsx
"use client";
import { useState } from "react";
import { selectExam } from "@/app/actions/exam";
import { EXAM_SLUGS, EXAM_LABEL } from "@/lib/exams";

export function ExamSwitcher({ currentLabel }: { currentLabel: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-full border px-3 py-1 text-sm font-medium">{currentLabel}</button>
      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="w-80 rounded-lg bg-background p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-semibold">Change your exam</h2>
            <div className="grid grid-cols-2 gap-3">
              {EXAM_SLUGS.map((slug) => (
                <form key={slug} action={selectExam.bind(null, slug)}>
                  <button type="submit" className="w-full rounded-md border p-3 hover:bg-accent">{EXAM_LABEL[slug]}</button>
                </form>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Write `app/(app)/dashboard/page.tsx`** (empty-state body; no hardcoded stats)

```tsx
import { and, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { users, batches } from "@/lib/db/schema";

export default async function Dashboard() {
  const sessionUser = await requireUser();
  const row = await db.query.users.findFirst({ where: eq(users.id, sessionUser.id) });
  const list = row?.activeExamId
    ? await db.query.batches.findMany({ where: eq(batches.examId, row.activeExamId) })
    : [];
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">Choose your path</h1>
        <div className="mt-4 flex gap-3">
          {["PDFs", "Gallery", "Tests"].map((p) => (
            <button key={p} disabled title="Coming soon" className="rounded-md border px-4 py-2 opacity-50">{p}</button>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Available batches</h2>
        {list.length === 0
          ? <p className="mt-2 text-muted-foreground">No batches yet.</p>
          : <ul className="mt-2 space-y-2">{list.map((b) => <li key={b.id} className="rounded-md border p-3">{b.name}</li>)}</ul>}
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Verify (needs a signed-in session)** — with real Google creds OR a temporary manual session row. Browser preview: after sign-in a first-time user lands on `/onboarding`; picking an exam lands on `/dashboard` showing the top bar, disabled content buttons, and "No batches yet." Exam switcher changes the chip label. No console errors.

  > If Google creds are not yet available, verify by inserting a user + session row manually (`docker exec … psql`) and setting the `sessionToken` cookie, then load `/dashboard`. Document that the full sign-in loop is pending client OAuth creds.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: dashboard shell, top bar, exam switcher"
```

---

### Task 7: Profile — info, phone edit, plans, logout

**Files:**
- Create: `lib/validation.ts`, `app/actions/profile.ts`, `app/profile/page.tsx`, `tests/validation.test.ts`

**Interfaces:**
- Consumes: `requireUser`, `db`, `users`/`plans`/`exams` tables, `signOut`.
- Produces:
  - `normalizePhone(input: string): string | null` from `lib/validation.ts` — strips non-digits, returns a 10-digit string or `null` if not exactly 10 digits.
  - `updatePhone(formData: FormData): Promise<void>` server action from `app/actions/profile.ts`.

- [ ] **Step 1: Write the failing validation test** — `tests/validation.test.ts`

```ts
import { expect, test } from "vitest";
import { normalizePhone } from "../lib/validation";
test("accepts 10 digits with noise", () => {
  expect(normalizePhone("+91 62845 82074".slice(3))).toBe("6284582074");
  expect(normalizePhone("628-458-2074")).toBe("6284582074");
});
test("rejects wrong length", () => {
  expect(normalizePhone("12345")).toBeNull();
  expect(normalizePhone("")).toBeNull();
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `npm test -- validation`
Expected: FAIL, `normalizePhone` not defined.

- [ ] **Step 3: Write `lib/validation.ts`**

```ts
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  return digits.length === 10 ? digits : null;
}
```

- [ ] **Step 4: Run — expect PASS**

Run: `npm test -- validation`
Expected: 2 passed.

- [ ] **Step 5: Write `app/actions/profile.ts`**

```ts
"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { normalizePhone } from "@/lib/validation";

export async function updatePhone(formData: FormData) {
  const user = await requireUser();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  if (!phone) throw new Error("Enter a valid 10-digit phone number");
  await db.update(users).set({ phone }).where(eq(users.id, user.id));
  revalidatePath("/profile");
}
```

- [ ] **Step 6: Write `app/profile/page.tsx`**

```tsx
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { users, plans, exams } from "@/lib/db/schema";
import { updatePhone } from "@/app/actions/profile";
import { signOut } from "@/auth";

export default async function Profile() {
  const sessionUser = await requireUser();
  const row = await db.query.users.findFirst({ where: eq(users.id, sessionUser.id) });
  const myPlans = await db.select({ status: plans.status, expiresAt: plans.expiresAt, exam: exams.name })
    .from(plans).innerJoin(exams, eq(plans.examId, exams.id)).where(eq(plans.userId, sessionUser.id));
  return (
    <div className="mx-auto max-w-lg space-y-8 p-6">
      <section>
        <h1 className="text-2xl font-semibold">{row?.name}</h1>
        <p className="text-muted-foreground">{row?.email}</p>
      </section>
      <section>
        <h2 className="font-semibold">Phone</h2>
        <form action={updatePhone} className="mt-2 flex gap-2">
          <input name="phone" defaultValue={row?.phone ?? ""} inputMode="numeric" placeholder="10-digit number" className="rounded-md border px-3 py-2" />
          <button type="submit" className="rounded-md border px-4 py-2">Save</button>
        </form>
      </section>
      <section>
        <h2 className="font-semibold">My plans</h2>
        {myPlans.length === 0
          ? <p className="text-muted-foreground">No active plans.</p>
          : <ul className="mt-2 space-y-2">{myPlans.map((p, i) => (
              <li key={i} className="rounded-md border p-3">{p.exam} — {p.status}{p.expiresAt ? ` (expires ${p.expiresAt.toDateString()})` : ""}</li>
            ))}</ul>}
      </section>
      <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
        <button type="submit" className="rounded-md border px-4 py-2">Log out</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 7: Verify** — signed-in session: `/profile` shows name/email, saving a valid phone persists (re-load shows it), an invalid phone surfaces the error, "My plans" shows empty state, Log out returns to `/` logged out.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: profile page — phone edit, plans, logout"
```

---

## Self-Review

**Spec coverage:**
- Stack (Next full-stack + Postgres + Drizzle + Auth.js Google) → Tasks 0–2 ✓
- Data model incl. deferred tables + dedupe/unique constraints → Task 1 ✓
- Google sign-in, no OTP/password → Task 2 ✓
- Landing/login + robots/sitemap → Task 3 ✓
- Middleware protection → Task 4 ✓
- Onboarding gate + exam selection → Task 5 ✓
- Dashboard shell, top bar, exam switcher, no popup, no hardcoded stats → Task 6 ✓
- Profile: info, optional unverified phone, My Plans, logout → Task 7 ✓
- Re-scaffold (strip real estate) → Task 0 ✓
- Non-goals (video, content population, payments, admin, notifications content) → not built ✓
- Deferred deps (real DB URL, Google creds, content data, brand identity) → noted in Tasks 1/2/6 ✓

**Placeholder scan:** No TBD/TODO in steps; every code step has real code. Brand "Genforce" is an intentional placeholder per Global Constraints (design-DNA later), not a plan gap.

**Type consistency:** `activeExamId` (schema `active_exam_id`), `needsOnboarding({activeExamId})`, `selectExam(slug)`, `normalizePhone` used consistently across Tasks 1/5/6/7. Auth.js table names in `auth.ts` (Task 2) match `lib/db/schema.ts` (Task 1). Verify adapter column expectations in Task 2 Step 1 before relying on them.

**Known risk flagged in-plan:** Auth.js v5 and Next 16 APIs may drift from the code shown; Tasks 0/2/4 begin with a "read the installed docs" step to reconcile before implementing.
