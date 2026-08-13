# Real Estate Website — Starter Template

The reusable base every client project is duplicated from. It's intentionally
**generic and brand-free** — no client content, neutral greyscale theme, sample
data only. Duplicate it, swap the client-specific bits, replace the sample data,
and follow the agency launch checklist before handoff.

Built to the agency standards in `../CLAUDE.md`, `../SKILL.md`, and
`../REAL-ESTATE-CHECKLIST.md`.

---

## Stack

- **Next.js 16** (App Router, server-rendered) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** primitives (built on **Base UI**, `@base-ui/react` — not Radix)
- Forms: **react-hook-form** + **zod**, delivered via **Resend**
- Images: **next/image**

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

Regenerate the placeholder sample images any time:

```bash
node scripts/generate-placeholders.mjs
```

### Offline dev (no database)

To run the full signed-in app with **no Postgres/Neon and no Google OAuth** —
e.g. for local UI work or verification — use the embedded PGlite database:

```bash
npm run db:local                              # seed ./.pglite (exams + demo AFCAT content + dev sessions)
DATABASE_URL=pglite://.pglite npm run dev -- -p 3007
```

`DATABASE_URL=pglite://<dir>` makes `lib/db/index.ts` run an in-process Postgres
(PGlite) instead of postgres.js — no server, no install. It's a devDependency,
imported dynamically only on that branch, so production (a `postgres://` URL) is
unaffected. "Sign in" by setting a cookie on the page:

```js
document.cookie = "authjs.session-token=dev-session-afcat; path=/"   // populated AFCAT
document.cookie = "authjs.session-token=dev-session-nda; path=/"     // empty states
document.cookie = "authjs.session-token=dev-session-onboard; path=/" // onboarding
```

Stop `next dev` before re-running `db:local` (both hold the `./.pglite` dir).

---

## What's pre-built

**Pages** (agency §3 default page set)

| Route | Page |
|-------|------|
| `/` | Home — hero, featured listings, appraisal CTA |
| `/listings` | Listings grid (property cards) |
| `/listings/[slug]` | Single listing — gallery, details, features, inspections, map slot, enquiry form, JSON-LD |
| `/about` | About/agent — photo slot, bio, trust signals, testimonials |
| `/contact` | Contact — enquiry form + NAP + map slot |
| `/privacy`, `/terms` | Legal stubs |
| `/not-found` | Custom 404 |
| `/api/contact` | Placeholder enquiry endpoint |
| `/sitemap.xml`, `/robots.txt` | Generated (native metadata routes) |

**Reusable components**

- `components/site-header.tsx` — logo slot, desktop nav, mobile hamburger (Sheet), skip link
- `components/site-footer.tsx` — NAP block, legal links, licence slot
- `components/listings/property-card.tsx` — **the most-reused piece**; photo, price, specs, CTA. Semantic tokens only, so a brand-colour swap needs zero edits here
- `components/listings/property-specs.tsx` — beds/baths/car/area row
- `components/listings/status-badge.tsx` — status → badge (guards against a stale "For Sale" on a sold listing)
- `components/listings/property-gallery.tsx` — carousel gallery
- `components/map-embed-slot.tsx` — address text + reserved, lazy map slot
- `components/inquiry-form.tsx` — validated enquiry form (reused on listing + contact)

**Data layer**

- `lib/types.ts` — `Property` type = the canonical RE-1 record
- `lib/format.ts` — price (POA/offers-over/auction), area, status, address helpers
- `lib/sample-listings.ts` — ⚠️ **sample data, replace per client**
- `lib/site.ts` — central per-client config (name, nav, contact/NAP, URL)

**Baked-in non-negotiables** (agency §2): mobile-first, no horizontal scroll,
preloaded hero (`priority`) + reserved aspect ratios (no CLS), WCAG 2.2 AA basics
(skip link, focus states, alt text, labels, semantic landmarks), unique per-page
meta + one H1, sitemap/robots that **don't block AI crawlers**.

---

## What to swap per client

Most edits are in **two files** plus the logo:

1. **`lib/site.ts`** — brand name, tagline, description, nav, contact/NAP, site URL, licence number.
2. **`app/globals.css`** — the `BRAND TOKENS` block: `--primary` (the one accent, reserved for CTAs/links), `--ring`, and the rest of the palette. Keep AA contrast.
3. **Logo** — drop the file in `/public` and swap the logo slot in `components/site-header.tsx`.

Then:

- **Fonts** — `app/layout.tsx` (Geist by default) → the client's licensed fonts.
- **Listing data** — replace `lib/sample-listings.ts` with the real source (structured JSON, Sanity CMS, Google Sheet, or MLS/IDX feed — CLAUDE.md §1). Keep the `Property` shape from `lib/types.ts`.
- **Photos** — replace everything in `/public/sample` with real, licensed photography (and update `alt` text).
- **Form delivery** — enquiries go through **Resend** (`app/api/contact/route.ts`). Copy `.env.example` → `.env.local` and set `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (a verified Resend sender). Until all three are set the endpoint runs a dev fallback (logs a warning, doesn't deliver). **Test end-to-end** before launch — an undelivered form is the #1 silent launch failure.
- **Map** — drop the client's map embed into `MapEmbedSlot` (lazy-loaded).
- **Legal** — replace the `/privacy` and `/terms` placeholder copy with real, jurisdiction-reviewed policies.

> Search the repo for `TODO(client)` and `BRAND_` to find every swap point.

---

## Duplicate this template for a new client

```bash
# from C:\Ai Kaarigar
cp -r starter-template "clients/<client-name>"
cd "clients/<client-name>"
rm -rf .git node_modules .next .env.local   # never carry the source project's secrets/emails
git init
npm install
cp ../../intake-template.md intake.md   # then fill in the client's answers
cp .env.example .env.local              # then set the Resend + site URL values
npm run dev
```

Then work through: fill `intake.md` → edit `lib/site.ts` + `globals.css` tokens +
logo → replace sample listings & photos → wire form delivery → run the
**SKILL.md Phase 6 / Launch** checklist before handoff. While the project lives
under `C:\Ai Kaarigar\`, it inherits the agency root `CLAUDE.md` automatically;
if you move it out, copy the agency standards in alongside it.

---

## Notes / gotchas

- **shadcn here is Base UI, not Radix.** Compose with the `render={<X/>}` prop, not `asChild`. See any `components/ui/*.tsx` for the pattern.
- **`params` is a Promise** in dynamic routes (Next 16) — `const { slug } = await params`.
- `npm audit` reports advisories from the scaffold's transitive build tooling; review before launch (Phase 20) but they're not runtime issues.
