---
name: ops-safety
description: How to operate Vercel/Neon/Razorpay/R2 for genforce safely, and what Claude must never do
type: reference
---

- **`master` = production.** Vercel auto-deploys every push to `master`. Work on branches; merge via PR when ready to go live.
- **Local `.env` points at a localhost Postgres, not production.** Production values exist only in Vercel (as Sensitive vars) and in the Neon / Google Cloud / Razorpay / Cloudflare dashboards. Day-to-day dev uses offline PGlite (`DATABASE_URL=pglite://.pglite`, see README).
- **Running a script against production Neon:** put the Neon URL in a throwaway env file, run `node --env-file=<file> --import tsx scripts/<x>.mts`, then delete the file (it holds the DB password). Don't use `npm run db:import`/`db:seed` for this — they hardcode `--env-file=.env` (localhost).
- **`scripts/reset-batches.mts` is destructive** — deleting batches cascades to orders, entitlements, subjects, lessons. Dry run by default; `--apply` only with explicit owner approval.
- **Vercel Sensitive vars** can't be read back; to change one, Remove + Add (or use the Edit form's Value box). Redeploy after env changes: `npx vercel redeploy <prod-url>` (get the URL from `npx vercel ls genforce --prod`).
- **Claude must never type payment API keys or other secrets** (Razorpay, R2, DB passwords, OAuth secrets). The owner pastes them into Vercel; Claude may redeploy and verify. Non-secret values (e.g. `ADMIN_EMAILS`, `OFFER_ENDS_AT`) Claude may set.
- **Razorpay:** webhook URL `https://<domain>/api/webhooks/razorpay`, event `payment.captured` (the only one the route handles). Test and Live modes have separate keys and webhooks. UPI/QR needs no code — the hosted Checkout shows it when UPI is enabled in the dashboard.
- **Production health checks after a deploy:** `/api/payments/mock-capture` must return 404 (mock off); an unsigned POST to the webhook must return 400.
- **This GitHub repo is public.** Never commit secrets, `.env*` files (except `.env.example`), personal emails, or customer data — including in `docs/memory/`.
