# Genforce — Phase 0+1: Foundation + Auth/Dashboard Shell

**Date:** 2026-08-09
**Status:** Approved design (spec)
**Product:** Genforce — exam-prep learning platform for Indian defence entrance exams (AFCAT / NDA / CDS / CAPF)
**Reference (product concept only, NOT UI/UX):** nexield.in / "ZincOxi Journey" — see `C:\Users\Acer\Downloads\nexield-site-audit.md`

---

## 1. Context

Genforce is a full LMS: users sign in, pick an exam, subscribe to batches, and watch
recorded video lessons organised as **Exam → Batch → Subject (named teacher) → Lesson**,
plus three exam-wide content pools (PDFs, image gallery, G-Form practice tests).

The whole platform is decomposed into phases, each with its own spec → plan → build:

- **Phase 0 — Foundation** (this spec): stack, DB schema, re-scaffold, sessions
- **Phase 1 — Auth + dashboard shell** (this spec): Google sign-in, onboarding, dashboard, profile, exam switcher
- Phase 2 — Core learning + content pools (batches/subjects/lessons/video, PDFs/gallery/tests)
- Phase 3 — Subscription + payments (Razorpay)
- Phase 4 — Admin/CMS, notifications, legal pages, SEO, polish

**This spec covers Phase 0 + Phase 1 only.** It gets a logged-in user to a working but
empty dashboard on the new Genforce design.

The project currently holds a real-estate starter scaffold (wrong product type). Part of
this phase is stripping that out and re-scaffolding for the LMS while keeping the toolchain.

---

## 2. Stack

- **Framework:** Next.js 16 (App Router), full-stack — server actions + route handlers as the API
- **Styling/UI:** Tailwind CSS 4 + shadcn/ui primitives (kept from current scaffold)
- **Database:** PostgreSQL
- **ORM:** Drizzle (`drizzle-orm` + `drizzle-kit`, `postgres` driver)
- **Auth:** Auth.js (NextAuth v5) with the **Google provider** + `@auth/drizzle-adapter`
- **Sessions:** Auth.js httpOnly cookie. No passwords, no OTP, no SMS.
- **Deploy (target):** Hostinger VPS (Node) per agency default; Postgres host TBD by client (managed e.g. Neon, or on the VPS). Not a blocker for build.

### Reversible defaults (chosen, open to veto)
- Drizzle over Prisma (lighter, SQL-first, strong TS inference)
- Auth.js Google-only (no credentials provider) — email/phone auth can be added later without schema loss

---

## 3. Data model (PostgreSQL via Drizzle)

Auth.js adapter-managed tables: `users`, `accounts`, `sessions`, `verification_tokens`.
We extend `users` and add domain tables.

### Wired in Phase 0+1

```
users            -- Auth.js base + extensions
  id            uuid pk
  name          text          -- from Google
  email         text unique   -- from Google
  image         text          -- from Google
  phone         text null     -- optional, collected on profile, NOT verified
  active_exam_id uuid null fk -> exams.id
  created_at    timestamptz default now()

accounts / sessions / verification_tokens  -- Auth.js adapter schema (unchanged)

exams            -- seeded, fixed set
  id   uuid pk
  slug text unique   -- afcat | nda | cds | capf
  name text          -- AFCAT | NDA | CDS | CAPF

plans            -- a user's access to an exam (feeds profile "My Plans" + Phase 3 gating)
  id         uuid pk
  user_id    uuid fk -> users.id
  exam_id    uuid fk -> exams.id
  status     text     -- active | expired | none
  expires_at timestamptz null
  created_at timestamptz default now()
  unique (user_id, exam_id)
```

### Schema-defined now, populated in Phase 2

```
batches
  id uuid pk, exam_id fk, name text, cycle text, sort int

subjects
  id uuid pk, batch_id fk, name text, teacher text, cover_image text null, sort int

lessons
  id uuid pk, subject_id fk, idx int, title text,
  source text,            -- zoom | vimeo
  play_token text null,   -- opaque token resolved server-side to a playable url
  play_url text null,
  duration_sec int null,  -- nullable: vimeo-sourced may have no real metadata
  recorded_on date null,
  size_bytes bigint null
  unique (subject_id, idx)

pdfs
  id uuid pk, exam_id fk, filename text, url text, file_hash text, uploaded_at timestamptz
  unique (exam_id, file_hash)      -- dedupe: prevents nexield's 68% duplicate bug

gallery_images
  id uuid pk, exam_id fk, url text, created_at timestamptz

test_forms
  id uuid pk, exam_id fk, set_name text null, time_limit_min int null,
  form_url text, form_date date null
  -- validation at write time: form_url MUST be a /viewform link, never /edit (nexield leak)
```

> Populated-later tables ship as migrations now so the schema is stable; Phase 2 fills them.
> Dedupe/validation constraints exist from day one — the nexield audit's top findings
> (duplicate PDFs/forms, leaked editor URLs) are designed out structurally.

---

## 4. Auth + shell flow

### Sign-in
1. Logged-out `/` = marketing landing (new Genforce identity) with a **"Sign in with Google"** CTA.
2. `/login` = minimal page with the same Google button (for direct links).
3. Google OAuth via Auth.js → callback → user upserted → session cookie set.

### Onboarding (first login only)
- If `users.active_exam_id IS NULL` → redirect to `/onboarding`: pick one of AFCAT / NDA / CDS / CAPF → sets `active_exam_id` → redirect to dashboard.

### Logged-in dashboard (`/`)
- **Top bar:** logo, user name, **exam chip** (opens switcher), notifications bell (stub — empty state), account icon → `/profile`.
- **Body:** "choose your path" heading, content-pool entry buttons (PDFs / Gallery / Tests — present but stubbed/disabled until Phase 2), **Available Batches** list for the active exam (empty until Phase 2).
- **No unskippable welcome popup** (deliberately dropped — nexield flaw #11).
- Stats strip: only render real values; no hardcoded "95% uptime" (nexield flaw #9). Omit until there's real data.

### Exam switcher
- Modal listing the four exams; selecting one updates `active_exam_id` (server action) and refreshes the dashboard for that exam.

### Profile (`/profile`)
- Personal info from Google (name, email, avatar); optional editable `phone` (no verification).
- **My Plans:** rows from `plans` for this user (exam, status, expiry). Empty state when none.
- **Log out** (Auth.js signout).

### Routes this phase
| Route | Auth | Purpose |
|---|---|---|
| `/` | both | Landing (logged-out) / dashboard (logged-in) |
| `/login` | public | Google sign-in |
| `/onboarding` | private | First-run exam selection |
| `/profile` | private | Profile, plans, logout |
| `/api/auth/*` | — | Auth.js handlers |

Middleware protects private routes; unauthenticated access → `/login`.

Also ship (fixing nexield gaps, cheap now): `robots.txt`, `sitemap.xml`, and route stubs/plan for `privacy` / `terms` / `refund` (content Phase 4).

---

## 5. Re-scaffold plan (strip real estate)

**Remove:** `app/listings`, `app/listings/[slug]`, real-estate `app/page.tsx` content,
`app/about` + `app/contact` real-estate copy (repurpose shells), `components/listings/*`,
`components/map-embed-slot.tsx`, `components/inquiry-form.tsx` (real-estate),
`lib/sample-listings.ts`, real-estate types in `lib/types.ts`, real-estate `sitemap.ts`/`robots.ts` (regenerate).

**Keep:** Next 16 + Tailwind 4 + shadcn primitives (`components/ui/*` — button, dialog, sheet,
input, label, form, select, card, avatar, badge, navigation-menu, carousel reused),
`components.json`, `tsconfig`, `eslint.config`, `next.config.ts`, `postcss.config`.

**Add deps:** `drizzle-orm drizzle-kit postgres next-auth@beta @auth/drizzle-adapter`
(`zod` already present).

**Add:** `lib/db/` (Drizzle client + schema), `drizzle.config.ts`, `auth.ts` (Auth.js config),
`middleware.ts`, `.env` keys: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXT_PUBLIC_SITE_URL`.

---

## 6. Dependencies client provides later (not build blockers)

- **Postgres connection string** (`DATABASE_URL`) — for real DB; local Postgres used during build.
- **Google OAuth client ID + secret** — from a Google Cloud project (OAuth consent + credentials). Build proceeds with placeholder env; real login needs these.
- **Content data** — batches/subjects/lessons/PDFs/gallery/forms (Phase 2).
- **Brand identity** — Genforce name/logo/palette/fonts. A short **design-DNA pass** runs before Phase 1 screens are built so the UI/UX is genuinely distinct from nexield's "ZincOxi Journey".

---

## 7. Non-goals (this spec)

Video playback + token resolution, content-pool population, subscription/payments (Razorpay),
admin/CMS, notification content, phone/email OTP verification, multi-exam plans purchasing.
All deferred to later phases. Their tables/routes are stubbed but not functional.

---

## 8. Testing

- Auth.js Google flow verified end-to-end once client OAuth creds exist (login → session → protected route → logout).
- Drizzle migrations apply cleanly to a fresh Postgres; seed inserts the 4 exams.
- Middleware: unauthenticated hits to `/profile`/`/onboarding` redirect to `/login`.
- Onboarding gate: `active_exam_id IS NULL` forces `/onboarding` before dashboard.
- Dedupe constraint: inserting a duplicate `(exam_id, file_hash)` PDF is rejected.
- Dev-server smoke test in the browser preview (no console errors, pages render).
