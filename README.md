# Genforce LMS

Learning platform for Indian defence-entrance exam prep (AFCAT / NDA / CDS / CAPF).
Students sign in with Google, pick their exam, browse courses (batches), and unlock
video lessons, PDFs, galleries and practice tests. Paid batches unlock per course
via Razorpay.

- **Live:** https://genforce-sooty.vercel.app (temporary Vercel domain)
- **Status / what the client still owes:** [`docs/HANDOFF.md`](docs/HANDOFF.md), [`CLIENT-INPUTS.md`](CLIENT-INPUTS.md)

> ⚠️ **`master` auto-deploys to the live site on Vercel.** Every push to `master`
> ships to production. Work on a branch and open a pull request; merge to
> `master` only when it's ready to go live.

---

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** — read `AGENTS.md`: Next 16 has breaking changes vs older docs
- **Tailwind CSS v4** + **shadcn/ui on Base UI** (`@base-ui/react`, not Radix — use the `render={<X/>}` prop, not `asChild`)
- **Auth.js v5** (Google sign-in) with the Drizzle adapter
- **Drizzle ORM** on **Postgres** — Neon in production, embedded **PGlite** for offline dev
- **Razorpay** payments (currently Test mode)
- **Cloudflare R2** for self-hosted videos/PDFs (optional) — see [`docs/R2-SETUP.md`](docs/R2-SETUP.md)
- **Vitest** tests, hosted on **Vercel**

Requires **Node 20.9+**.

---

## Setup

```bash
git clone https://github.com/salariaaksh-ui/genforce.git
cd genforce
npm install
cp .env.example .env
```

Then pick a mode:

### A. Offline mode (recommended for day-to-day work — no secrets needed)

Runs the whole signed-in app on an embedded Postgres in `./.pglite`. No Neon, no
Google OAuth, no Razorpay account. Nothing you do touches production data.

In `.env` set:

```env
DATABASE_URL=pglite://.pglite
AUTH_SECRET=any-long-random-string
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_MOCK=1
ADMIN_EMAILS=dev-owner@example.com
```

(The Razorpay keys must be **empty** — any value, even `placeholder`, switches
off the mock checkout.)

```bash
npm run db:local   # create + seed ./.pglite (exams, demo AFCAT content, dev sessions)
npm run dev        # http://localhost:3007
```

Stop `npm run dev` before re-running `db:local` (both hold the `.pglite` folder).
Delete the `.pglite` folder to start from a clean database.

**Sign in** without Google: open http://localhost:3007, then run one of these in
the browser console and reload:

```js
document.cookie = "authjs.session-token=dev-session-afcat; path=/"   // AFCAT student, paid batch locked
document.cookie = "authjs.session-token=dev-session-owner; path=/"   // owns the paid batch (+ /admin if in ADMIN_EMAILS)
document.cookie = "authjs.session-token=dev-session-nda; path=/"     // empty states
document.cookie = "authjs.session-token=dev-session-onboard; path=/" // onboarding flow
```

### B. Full mode (real Google sign-in, Razorpay test keys, R2)

Needs real values that are **never committed to Git** and only exist in the
Neon / Google Cloud / Razorpay (test mode) / Cloudflare dashboards — ask the
project owner. (Vercel stores them as Sensitive, so `vercel env pull` returns
`[SENSITIVE]` placeholders, not values.) Every variable is documented in
[`.env.example`](.env.example). Add your own Google email to `ADMIN_EMAILS` to
reach `/admin`.

> ⚠️ Never point local `DATABASE_URL` at the **production Neon database** — the
> app, `db:import` and every script would write to live data. Use offline mode,
> or a separate Neon branch for development.

## Shared Claude memory

Project notes for Claude live in [`docs/memory/`](docs/memory/MEMORY.md) and are
shared through git — `git pull` to get the other developer's notes. Open Claude
Code **in this folder** so `CLAUDE.md` (and the memory index) loads.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on http://localhost:3007 (port must stay 3007 — OAuth redirect + `NEXT_PUBLIC_SITE_URL` expect it) |
| `npm run build` / `npm start` | Production build / serve it |
| `npm test` | Vitest unit tests |
| `npm run lint` | ESLint |
| `npm run db:local` | Seed the offline PGlite database |
| `npm run db:generate` | Generate a Drizzle migration after editing `lib/db/schema.ts` (commit the new files in `drizzle/`) |
| `npm run db:migrate` | Apply migrations to the `.env` `DATABASE_URL` |
| `npm run db:seed` | Seed exams into the `.env` database |
| `npm run db:import <file.json> [-- --dry]` | Import course content (format: `docs/superpowers/samples/`) |

One-off maintenance scripts live in `scripts/` — read the header comment of each
before running. `reset-batches.mts` is **destructive** (cascade-deletes orders).

---

## Project map

| Path | What |
|---|---|
| `app/(marketing)` | Public landing page |
| `app/(app)` | Signed-in student app: dashboard, batches, subjects, lessons, PDFs, gallery, tests, checkout |
| `app/admin` | Content admin panel (gated by `ADMIN_EMAILS`) |
| `app/api` | Auth, Razorpay verify/webhook, mock payments (dev only), R2 upload URLs |
| `auth.ts`, `proxy.ts` | Auth.js config; route protection (Next 16 "proxy" = middleware) |
| `lib/db` | Drizzle schema, DB builder (postgres vs pglite), queries, seed |
| `lib/payments`, `lib/storage` | Razorpay logic; R2 client |
| `drizzle/` | SQL migrations |
| `docs/` | Handoff, R2 setup, design specs and plans |

---

## Workflow

1. `git pull` before you start.
2. Create a branch: `git checkout -b feat/short-name`.
3. Before pushing: `npm run lint && npm test && npm run build`.
4. Push the branch and open a pull request. Merging to `master` deploys live.
