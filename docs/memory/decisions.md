---
name: decisions
description: Owner/client decisions already made for genforce — follow them, don't re-ask
type: project
---

- **Auth = Google account only.** No password, OTP or SMS sign-in.
- **A "course" = a Batch.** Purchase is per batch, each with its own price. `priceInr > 0` = paid/locked; null/0 = free. `accessDays` null = lifetime. Re-purchase extends access.
- **Content model:** Exam → Batch → Subject (named teacher) → Lesson (video), plus PDFs, gallery, practice tests (Google Forms) per exam.
- **Reference site (nexield / "ZincOxi Journey") is for structure only.** Never copy its content or UI. Its flaws are deliberately designed out: welcome-popup gate, fake stats strip, hit counter, dual OTP signup, duplicate PDFs, leaked form-editor URLs.
- **Videos:** paste a link (YouTube unlisted / Vimeo / Zoom) or upload to Cloudflare R2. Never upload through the server (Vercel 4.5 MB body cap; class videos are 100–500 MB) — the browser PUTs straight to R2 via a presigned URL.
- **Content is managed by the client team in `/admin`** (access = `ADMIN_EMAILS` allowlist). No CLI needed for day-to-day content.
- **Prices shown are real** and the discount is enforced server-side (`lib/payments/core.ts`), never display-only.
- **Course thumbnails show the full poster** (`object-contain`, never crop the card image).
- Not wanted / deferred (owner said unimportant): WhatsApp channel link, help/support nav link, notifications bell, free trial.
- Hosting is Vercel (auto-deploy from `master`), even though the agency default is Hostinger.
