# Genforce LMS — Handoff & Status

_Last updated: 14 August 2026_

Genforce is a learning platform for Indian defence-entrance exam prep (AFCAT / NDA / CDS / CAPF). Students sign in with Google, browse courses, and unlock video lessons, notes, galleries, and practice tests. Paid courses are unlocked per-course.

---

## Live

- **URL:** https://genforce-sooty.vercel.app _(temporary Vercel domain — swap for the client's own domain at launch)_
- **Hosting:** Vercel, auto-deploys on every push to `master` (GitHub `salariaaksh-ui/genforce`)
- **Database:** Neon Postgres (provisioned, migrated, seeded)
- **Login:** Google sign-in — **working**

---

## Built & working

| Area | Status |
|---|---|
| Google sign-in + onboarding (pick your exam) | ✅ |
| Dashboard hub (study material + your courses) | ✅ |
| Course catalog with photo thumbnails | ✅ |
| Course → Subject → Lesson (video player) | ✅ |
| PDFs, Gallery, Practice Tests sections | ✅ |
| Per-course paid unlock + checkout (Razorpay) | ✅ built, keys pending |
| Payment security (signature verify, idempotent) | ✅ |
| Content importer (JSON → database) | ✅ |
| Light / dark theme toggle | ✅ |
| Empty / loading / error states everywhere | ✅ |
| Mobile-responsive, motion (reduced-motion safe) | ✅ |

**Demo content loaded** so the platform isn't empty for the demo: AFCAT → *Juliet Batch*; CAPF → *India Batch* + *Game Changer* (with the client's own promo photos as thumbnails). This is placeholder demo data — replace with the real course catalog via the importer.

---

## Verified this pass

- **Build:** clean (`next build` passes)
- **Tests:** 38/38 pass
- **Lint:** 0 errors
- **Security headers:** live (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP frame-ancestors)
- **SEO:** unique titles/meta per page, one H1, canonical, OG/Twitter, sitemap.xml, robots.txt (AI crawlers allowed, private routes disallowed), no accidental noindex
- **Accessibility:** skip link, landmarks, focus states, alt text, AA contrast (fixed the one failing pill)
- **Privacy & Terms:** real professional copy in place (see "client owes" for the legal review note)
- **Cleanup:** removed 11 unused components + 4 unused dependencies; hardened the mock-payment guard so it can never open in production

---

## What the client still needs to provide (before full public launch)

| # | Item | Why it's needed | Blocks |
|---|---|---|---|
| 1 | **Real course content** (videos, notes, tests) | Everything shows demo/empty until loaded | Real launch |
| 2 | **Razorpay LIVE keys** (after KYC) + a LIVE-mode webhook | Payments are connected in **Test mode** and working; live money needs activated (KYC) live keys + a live webhook, then update the 3 Vercel env vars | Paid launch |
| 3 | **Own domain** | Site is on a temporary `.vercel.app` URL; also update the Google OAuth redirect + `NEXT_PUBLIC_SITE_URL` + the Razorpay webhook URL, and deindex the old URL | Launch |
| 4 | **Real support email** | Privacy/Terms show a placeholder address | Launch |
| 5 | **Legal review** | Privacy & Terms are solid drafts but should be reviewed by counsel for the client's jurisdiction | Launch |

**Done since first handoff:** ✅ Google login published (anyone can sign in) · ✅ real prices live (Juliet ₹2,540 · India ₹7,999 · Game Changer ₹9,999) · ✅ Razorpay connected in Test mode (keys + webhook, verified live).

Full technical detail for 1–5 lives in `CLIENT-INPUTS.md`.

---

## Known limitations / notes

- **Payments** are live in **Test mode** — use Razorpay test card `4111 1111 1111 1111` to try a purchase. Switch to Live keys (after KYC) to take real money.
- **Game Changer** thumbnail uses a clean branded banner crop (its source is a tall portrait poster; the full poster doesn't fit a wide card well). Juliet & India show the full photos with the baked-in price/cart graphics painted out.
- Payments have not been exercised end-to-end against **live** Razorpay keys (none issued yet).
- A full content-level CSP is deferred until the live payment flow can be tested, so a mis-scoped rule can't break checkout.

---

## Running locally (offline, no cloud needed)

```bash
npm install
npm run db:local          # embedded Postgres + demo content + dev sessions
npm run dev               # http://localhost:3007
```

To load real content: `npm run db:import <file.json>` (see `docs/superpowers/samples/` for the format).
