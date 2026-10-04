---
name: gotchas
description: Non-obvious technical traps already hit in genforce — check here before debugging
type: project
---

- **Next 16:** middleware file is `proxy.ts`; `params`/`searchParams` are Promises. Read `node_modules/next/dist/docs/` before writing routes.
- **Env URLs:** Vercel passes unset vars as `""`. Use `||` not `??` for any env used to build a URL (`new URL("")` crashed `/_not-found` page-data collection).
- **`.env.production.local` from `vercel env pull`:** Sensitive vars come back as the literal `"[SENSITIVE]"`, so `npm run build` fails with `Invalid URL`. Move that file aside to build locally. Same reason scripts can't get the Neon URL this way.
- **tsx scripts + DB:** tsx treats `.ts` as CJS and top-level await fails. Scripts import `buildDb()` from `lib/db/build.ts`; the app imports `db` from `lib/db/index.ts`.
- **PGlite (offline DB):** single connection. It corrupts (`RuntimeError: Aborted()`, poisons `.pglite`) under the dev server's concurrent writes, e.g. a mock purchase + `router.refresh()`. Not a code bug (impossible on Postgres). Verify writes with a single-connection script; delete `.pglite` and re-run `npm run db:local` to recover. Stop `next dev` before `db:local`.
- **pglite tests** can flake under concurrency; clean on rerun.
- **Razorpay mock mode** only turns on when `RAZORPAY_KEY_ID`/`SECRET` are empty — any value (even `placeholder`) disables it. Always off when `NODE_ENV=production`.
- **Auth.js v5 in production self-hosting** needs `trustHost: true` (already set in `auth.ts`), else `UntrustedHost` on `npm start`.
- **HTML forms:** a delete `<form>` can't be nested inside an edit `<form>` — use sibling forms (admin pages).
- **Motion:** `AnimatePresence mode="wait"` stalls next to a `layoutId` in the same subtree — swap content with a keyed `motion.div` remount instead.
- **R2 tests:** the S3 client is memoized, so deleting creds per test won't rebuild it; `env()` throws synchronously.
- **sharp:** `.resize()` runs before `.composite()` regardless of chain order — composite at full size to a buffer, then resize in a second `sharp()` call.
- **drizzle-kit** rename resolver needs a TTY — split column renames/drops into separate migrations.
- **Gallery** uses plain `<img>` because the image host varies; switch to `next/image` only after adding the host to `next.config` `remotePatterns`.
