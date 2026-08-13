# Spec 3 — Razorpay payments + per-course gate

**Date:** 2026-08-13
**Status:** approved

## Goal

Let a student unlock a paid course (batch) by paying with Razorpay, and stop
non-payers from reaching that course's content. Free courses stay open. The
purchase is **per-course (batch)**, matching the client's poster prices
(₹9,999 / ₹2,540 / ₹7,999 per course) already carried on `batches.priceInr`.

Reconciled from the nexield reference: reference gated batch entry
(`/api/check-batch-subscription`) and showed time-limited access in the profile
("expires 2 Nov 2026, 86 days left"). We keep the batch-level gate and support
time-limited access, but the *purchase unit* is the batch (each has its own
price), per the client's explicit decision.

## Model

- **Gate rule (price-driven):** a batch with `priceInr` set and `> 0` is **paid**
  — locked until the user holds a live entitlement for it. A batch with a null or
  `0` price is **free/open**. The exam-wide pools (PDFs, gallery, tests) stay free.
- **Access length:** add `batches.accessDays` (nullable integer). On purchase,
  `entitlement.expiresAt = now + accessDays days`; if `accessDays` is unset →
  **lifetime** (`expiresAt = null`). Data-driven and deferred to the importer /
  client; works today with lifetime as the default.
- **Authoritative enforcement is server-side** in `lib/db/queries.ts` (the spot
  marked by the existing `ponytail:` note). A locked batch blocks its subjects
  and lessons even by direct URL — this extends the existing exam-scoped IDOR
  guards, it does not replace them. UI lock states are cosmetic only.

## Schema (migration `0002`)

New tables:

- `orders`
  - `id` uuid pk
  - `userId` → users (cascade)
  - `batchId` → batches (cascade)
  - `amountInr` integer — price snapshot at order time (never trust the client / a
    later price edit)
  - `currency` text default `INR`
  - `razorpayOrderId` text **unique** — Razorpay's order id (or a mock id in dev)
  - `razorpayPaymentId` text nullable — set on capture
  - `status` text default `created` — `created | paid | failed`
  - `createdAt`, `paidAt` (nullable)

- `entitlements`
  - `id` uuid pk
  - `userId` → users (cascade)
  - `batchId` → batches (cascade)
  - `source` text — `purchase | grant` (grant = dev/manual)
  - `orderId` → orders (nullable — grants have no order)
  - `expiresAt` timestamp nullable (**null = lifetime**)
  - `createdAt`
  - **`unique(userId, batchId)`** — one entitlement row per user+batch;
    re-purchase extends `expiresAt` rather than inserting a duplicate.

Changes:

- Drop the unused per-exam `plans` table. It was only rendered in the profile and
  never enforced; entitlements replace it. Profile "My plans" → "My courses",
  reading entitlements.
- Importer: add optional `accessDays` to the batch zod schema, loader, and sample.

## Razorpay wiring

`lib/payments/razorpay.ts` — no new npm dependency; use `fetch` + `node:crypto`.

- **Order create:** `POST https://api.razorpay.com/v1/orders` with HTTP Basic auth
  (`key_id:key_secret`), `amount` in **paise**, `currency`, `receipt` = our order
  id, `notes` = `{ batchId, userId }`. Returns Razorpay order id.
- **Client checkout:** Razorpay hosted Checkout.js, loaded via a `<script>` on the
  checkout page only (kept off every other page for performance). Opened with
  `key_id` + the order id.
- **Payment verify:** on checkout success the client posts
  `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`. The server
  recomputes `HMAC_SHA256(order_id + "|" + payment_id, key_secret)` and compares
  **constant-time**. On match → mark the order `paid`, grant/extend the
  entitlement.
- **Webhook** `POST /api/webhooks/razorpay`: verify `X-Razorpay-Signature`
  (`HMAC_SHA256(rawBody, webhook_secret)`) and, on `payment.captured`, grant the
  entitlement **idempotently** (same payment delivered twice → still one
  entitlement). The webhook is the source of truth — the browser callback can be
  lost, so the entitlement must land even if only the webhook arrives.
- **Entitlement is granted only** after a server-side signature verify or webhook.
  The client is never trusted.
- Keys read from `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` /
  `RAZORPAY_WEBHOOK_SECRET`. Built now against placeholders; runs in Razorpay
  **test mode** as soon as the client fills them in.

## Offline dev mock

Mirrors the PGlite offline trick. When keys are unset **and** `RAZORPAY_MOCK=1`:

- order create returns a synthetic order id (no network call),
- a **dev-only** endpoint `POST /api/payments/mock-capture` grants the entitlement
  directly, so the full locked → checkout → unlock flow is verifiable with no real
  Razorpay account.

Guarded by env so it is **inert in production** (real keys present, `RAZORPAY_MOCK`
unset). Never grants without the mock flag.

## Pages / UX (brand DNA, `useReducedMotion`-aware)

- **Locked course cards** (dashboard + batch grid): lock badge + formatted price.
- **`/checkout/[batchId]`**: course summary, price, "Pay ₹X" button → Razorpay
  modal → on success redirect to the batch (now unlocked). Handles already-owned
  (redirect to batch) and free batches (redirect to batch, nothing to buy).
- **Subject grid** on a locked batch: lock overlay + "Unlock this course" CTA to
  the checkout page, instead of the subjects.
- **Profile → "My courses"**: entitlement list with `expiresAt` shown as a date or
  "Lifetime".
- **Success / failure states** on checkout.

## Security notes

- Amount is taken from the DB batch price at order-create, snapshotted on the
  order; the verify/webhook path never reads an amount from the client.
- Signature comparisons use `crypto.timingSafeEqual`.
- Webhook and verify are both idempotent on `(razorpayOrderId)` / `(userId,
  batchId)`.
- The gate lives at the query layer, so the API/pages can't accidentally bypass it.

## Tests

- **Unit:** signature verify (correct vs tampered), webhook signature, gate logic
  (free / paid-unowned / paid-owned / expired / lifetime), amount snapshot.
- **pglite integration:** create order → verify → entitlement granted → gate opens;
  webhook idempotency (double deliver → one entitlement); re-purchase extends
  `expiresAt`.

## Client inputs this adds

- Razorpay `key_id`, `key_secret`, `webhook_secret` (test keys to start).
- Optional per-course `accessDays` policy (lifetime if omitted).
- Prices already supplied via the importer (`priceInr`).

## Out of scope (YAGNI unless requested)

- Free-trial flow (reference had the concept but it returned `false`).
- Coupons / discounts.
- Refund UI (handled from the Razorpay dashboard).
- Invoices / GST documents.
