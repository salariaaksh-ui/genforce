---
name: current-state
description: Live batches and prices, what is built, open issues, what the client still owes (as of 2026-10-04)
type: project
---

**Live:** https://genforce-sooty.vercel.app (temporary Vercel domain). Neon Postgres in production. Google sign-in published (any Google account can log in).

**Batches in production (Aug 2026 poster — supersedes the older Juliet ₹2540 / India ₹7999 / Game Changer ₹9999 set, which was deleted):** all lifetime access
- CAPF: "Achieve CAPF Batch (Game Changer 2027)" ₹700 · "Achieve CAPF Foundation Programme" ₹2000
- CDS: "CDS Journey - Juliet Batch" ₹350 · "CDS Journey - Indian Batch" ₹1500
- AFCAT / NDA: no batches (empty by design until the client adds them). `scripts/add-subjects.mts` exists to add AFCAT/CDS subjects.
- Thumbnails: `public/courses/{capf-game-changer,capf-foundation,cds-juliet,cds-indian}.webp`, wired by `scripts/set-thumbnails.mts` (matches batch by exact name).

**Built and on `master`:** Google auth + onboarding, dashboard, catalog, Exam→Batch→Subject→Lesson, PDFs, gallery, practice tests, per-batch paid gate + Razorpay checkout, content importer, admin panel (`/admin`), early-bird offer (`OFFER_ENDS_AT`), Cloudflare R2 uploads (optional), light/dark, security headers. 56 tests, lint clean, build clean.

**Open issues:**
- Razorpay checkout returned `401 Authentication failed` in production (Aug 17). Vercel key vars were re-entered by the owner; **not yet confirmed fixed**. If still 401: key id/secret pair mismatched, or `rzp_live_` keys need Razorpay KYC activation (`rzp_test_` keys work before KYC).
- R2 is built but only works once the owner creates the bucket, API token, bucket CORS (allow PUT) and sets the 4 `R2_*` vars in Vercel — steps in `docs/R2-SETUP.md`.
- Early-bird offer is only active while `OFFER_ENDS_AT` (Vercel, non-sensitive) is set to a future time.

**Client still owes:** real course content (subjects/lessons, added via `/admin`), Razorpay KYC → live keys + live-mode webhook, own domain (then update Google OAuth redirect, `NEXT_PUBLIC_SITE_URL`, Razorpay webhook URL), real support email for Privacy/Terms, legal review of Privacy/Terms.

`docs/HANDOFF.md` is the Aug-14 client handoff — its batch/price section is stale; this file wins.
