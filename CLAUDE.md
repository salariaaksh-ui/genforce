# Project CLAUDE.md — Genforce LMS

Defence-exam prep LMS (AFCAT / NDA / CDS / CAPF). Not a real-estate site — the
agency real-estate standards do not apply here. Setup, scripts and project map:
`README.md`. Status and client blockers: `docs/HANDOFF.md`, `CLIENT-INPUTS.md`.

## Next.js version rules

@AGENTS.md

## Rules

- **`master` auto-deploys to production (Vercel).** Work on a branch + PR; never push untested work to `master`.
- **Default to offline dev:** `DATABASE_URL=pglite://.pglite` + `npm run db:local`. Do not run scripts, imports or migrations against the production Neon URL unless explicitly asked.
- Never commit `.env*` files (only `.env.example`). New env var → document it in `.env.example`.
- Schema change → edit `lib/db/schema.ts`, run `npm run db:generate`, commit the `drizzle/` migration.
- shadcn/ui here is **Base UI**, not Radix: compose with `render={<X/>}`, not `asChild`.
- Dynamic route `params` / `searchParams` are Promises in Next 16 — `await` them.
- Dev server runs on port **3007** (`npm run dev`); OAuth redirect and `NEXT_PUBLIC_SITE_URL` depend on it.
- Payments: never weaken signature verification or the `NODE_ENV` guard on mock mode (`lib/payments/razorpay.ts`).
- Before pushing: `npm run lint && npm test && npm run build` all pass.
- Motion respects `prefers-reduced-motion`; keep WCAG 2.2 AA (contrast, focus, labels, alt text).
