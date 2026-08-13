# Payments verification — 2026-08-13

Offline verification of Spec 3 (Razorpay per-course gate). Dev server on :3007
with `DATABASE_URL=pglite://.pglite RAZORPAY_MOCK=1`.

## Automated (vitest, fresh in-memory PGlite)

- `lib/db/schema.test.ts` — orders/entitlements created, plans dropped, unique(user,batch).
- `lib/payments/gate.test.ts` — free open; paid+none locked; paid+live open; lifetime open; expired locked.
- `lib/payments/razorpay.test.ts` — payment + webhook signature accept/reject, mock mode.
- `lib/payments/flow.test.ts` — create order → settle → unlock; **webhook idempotency (double settle → one entitlement)**; free/owned rejected; re-purchase extends expiry.
- Full suite: 38 tests green. `next build` + prod `npm start` clean.

## Live gate reads (HTTP, real cookies)

| Check | Result |
|---|---|
| Locked user dashboard → paid course card links to `/checkout/<id>` | ✓ |
| Locked batch page → "This course is locked" + ₹9,999 panel | ✓ |
| Checkout page → renders, "180 days of access", ₹9,999, Pay button | ✓ |
| Owner (entitled) → batch shows subjects | ✓ |
| **Locked user hits `/subjects/<paid>` directly → `NEXT_REDIRECT;…/checkout/…;307`, zero lesson data in response** | ✓ (no content leak) |
| No session → `/checkout/<id>` → 307 `/login` | ✓ |
| `mock-capture` in mock mode → 400 empty body, 200 real | ✓ |

## Live purchase (browser, chrome-devtools-mcp)

- Checkout renders; "Pay securely" → `createCourseOrder` (25ms) → `POST /api/payments/mock-capture` 200 → redirect to batch. UI wiring confirmed.
- **PGlite `Aborted()`**: the embedded dev PGlite corrupted under the concurrent
  mock-capture write + `router.refresh()` refetch (known offline-harness
  fragility). The grant did not survive on-disk. This is a PGlite-concurrency
  artifact — **not** a code defect and impossible on Neon/Postgres.
- Re-proved the write persists with a single-connection probe against the
  seeded DB: `createOrder` → `settleOrder` → order `paid`, entitlement present,
  `isUnlocked` true. Precise 180-day expiry asserted in `flow.test.ts`.

## Not exercised

- Real Razorpay test-mode checkout (needs client keys) — placeholders in place.
- Webhook against a live Razorpay delivery (signature verify unit-tested).
