# Authed-screen verification sweep — 2026-08-13

First runtime verification of every signed-in `(app)` screen. Previously these
were compile-verified only (blocked on DB + Google OAuth). Run locally against
an embedded PGlite database (`npm run db:local`, see README "Offline dev") with
hand-seeded sessions — no client credentials needed.

Method: `next dev -p 3007` + chrome-devtools. Two sessions: **AFCAT** (demo
content) for populated states, **NDA** (no content) for empty states. Checked
per screen: HTTP status, auth resolves (exam-scoped content renders, no login
redirect), one `<h1>`, unique `<title>`, no horizontal overflow, no console
errors. Spot-checked mobile (375px) and light theme.

## Results

| Screen | Populated (AFCAT) | Empty (NDA) | H1 | Unique title | Overflow | Notes |
|---|---|---|---|---|---|---|
| `/dashboard` | ✅ 200 | ✅ 200 | ⚠️→✅ **fixed** | ✅ | 0 | had no H1 — added `sr-only` H1 |
| `/batches/[id]` | ✅ 200 | n/a (NDA has no batches) | ✅ | ⚠️→✅ **fixed** | 0 | title was generic — added `generateMetadata`. "No subjects yet" child empty-state is in source, not browser-exercised |
| `/subjects/[id]` | ✅ 200 | n/a (NDA has no batches) | ✅ | ⚠️→✅ **fixed** | 0 | title was generic — added `generateMetadata`. "No lessons published yet" child empty-state is in source, not browser-exercised |
| `/lessons/[id]` | ✅ 200, Vimeo iframe renders (titled) | — | ✅ | ⚠️→✅ **fixed** | 0 | title was generic — added `generateMetadata` |
| `/pdfs` | ✅ 200 | ✅ "No PDFs uploaded yet" | ✅ | ✅ | 0 | |
| `/gallery` | ✅ 200, 3 images load | ✅ empty | ✅ | ✅ | 0 | `<img>` uses `alt=""` (decorative) — real captions arrive with client content |
| `/tests` | ✅ 200 | ✅ empty | ✅ | ✅ | 0 | |
| `/profile` | ✅ 200 | — | ✅ | ✅ | 0 | |
| `/onboarding` | ✅ 200, 4 exam cards | — | ✅ | ✅ | 0 | reached via a no-active-exam session |
| no cookie | — | — | — | — | — | ✅ correctly 307 → `/login` |

Themes: dark (default DNA) and light both AA (light body `#fbfcff`, H1 `#33355a`).
Mobile 375px: bento cards stack, top bar fits, no overflow. No console errors on
any screen.

## Fixes applied

1. **Dashboard missing H1** (§2 / Phase 13 — one H1 per page). The hub leads with
   eyebrow labels by design; added a visually-hidden `<h1>Dashboard</h1>` so the
   heading hierarchy starts at H1 without changing the visual design.
2. **Dynamic routes served the generic site `<title>`** (§2 / Phase 15 — unique
   title per page). Added `generateMetadata` to `batches/[id]`, `subjects/[id]`,
   `lessons/[id]`. The shared read queries (`requireActiveExam`, `getBatch`,
   `getSubject`, `getLesson`) are now wrapped in React `cache()` so metadata and
   the page body share one query per request. Confirmed `cache()` does not
   swallow the `requireActiveExam` → `/onboarding` redirect (un-onboarded session
   still 307s to onboarding through a page that calls the cached guard).

3. **Auth.js `UntrustedHost` in production** — surfaced by running the production
   build (`npm start`, `NODE_ENV=production`). Auth.js v5 rejects every request
   with `UntrustedHost` unless the host is trusted; on Vercel this is automatic,
   but the agency deploys to self-hosted Hostinger (Node), where it is not — so
   **every sign-in would have failed on launch**. Fixed with `trustHost: true` in
   `auth.ts`.

Runtime note: the production server (`npm start`) boots and serves with the db
module's top-level `await` resolving cleanly (no PGlite/db errors; the
`db`-importing `(app)` layout executes). Full auth→db→render was runtime-verified
on the dev server (production Auth.js secure-cookie handling over plain http
can't be exercised with hand-set cookies).

## Minor / deferred (not fixed)

- Gallery `<img alt="">` — acceptable for placeholder reference images; real alt
  text comes with client-provided gallery content.
- Top-bar controls (theme toggle, avatar) are 32×32 — passes WCAG 2.2 AA (≥24px)
  but below the agency's 44px "comfortable". Low priority.

## Still not verifiable without the client

- Real Google OAuth sign-in (needs `AUTH_GOOGLE_*`). Verified here with seeded
  database sessions, which exercise the same `auth()` + adapter path.
- Delivery of any real content (client provides it later).
- Payments / plan gate (Phase 3) — needs the client's Razorpay account + pricing
  policy; intentionally out of scope.
