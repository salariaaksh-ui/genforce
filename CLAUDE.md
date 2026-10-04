# Project CLAUDE.md — Genforce LMS

Defence-exam prep LMS (AFCAT / NDA / CDS / CAPF). Not a real-estate site — the
agency real-estate standards do not apply here. Setup, scripts and project map:
`README.md`. Status and client blockers: `docs/HANDOFF.md`, `CLIENT-INPUTS.md`.

## Next.js version rules

@AGENTS.md

## Shared memory (two developers, one Claude account, separate PCs)

Project memory lives **in this repo** at `docs/memory/`, so every developer's
Claude reads and writes the same notes through git. Index (auto-loaded):

@docs/memory/MEMORY.md

- **For this project, save memories to `docs/memory/` — never to the personal
  `~/.claude/projects/.../memory/` folder** (that one stays on one PC only).
- Same format as personal memory: one topic per file with `name` / `description`
  / `type` frontmatter, plus a one-line pointer in `docs/memory/MEMORY.md`.
  Update an existing file rather than adding a duplicate; fix or delete notes
  that turn out wrong. Read a topic file when its index line is relevant.
- Save what the code and git history don't already say: decisions, client
  requests, open issues, traps. Write "owner" / "client", not "the user".
- `git pull` before editing memory; commit memory changes together with the
  related work on its branch.
- This repo is **public**: no secrets, emails, or customer data in memory files.

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
