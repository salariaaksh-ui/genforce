# Razorpay Payments + Per-Course Gate — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unlock a paid course (batch) via Razorpay and block non-payers from its content, server-side.

**Architecture:** New `orders` + `entitlements` tables. Gate enforced at the query layer (`lib/db/queries.ts`). Razorpay via `fetch` + `node:crypto` (no SDK dep); hosted Checkout.js on the checkout page only. Entitlement granted only after server-side signature verify or webhook. Offline dev mock mirrors the PGlite trick.

**Tech Stack:** Next 16 (App Router), Drizzle + Postgres/PGlite, Auth.js v5, zod, motion, vitest.

## Global Constraints

- Next 16 — route middleware file is `proxy.ts` (not `middleware.ts`). Read `node_modules/next/dist/docs/` before new route conventions.
- Dev server port **3007**.
- No new npm dependency for Razorpay — `fetch` + `node:crypto` only.
- Entitlement granted ONLY after server-side verify/webhook; client never trusted.
- Amount snapshotted from DB batch price at order-create; never read from client.
- Signature compares use `crypto.timingSafeEqual`.
- Verify + webhook idempotent.
- All motion gated by `useReducedMotion()`; brand DNA tokens (`globals.css`).
- Offline dev/mock env-gated, inert in production.
- `next build` + `vitest run` green after every task.

---

### Task 1: Schema — orders, entitlements, drop plans, add accessDays

**Files:**
- Modify: `lib/db/schema.ts` (add `orders`, `entitlements`; remove `plans`; add `batches.accessDays`)
- Create: `drizzle/0002_*.sql` (via `db:generate`)
- Modify: `app/profile/page.tsx` (stop importing `plans` — swapped in Task 6, temporary stub ok)
- Test: `lib/db/schema.test.ts` (migration applies clean in pglite)

**Produces:** `orders`, `entitlements` tables; `batches.accessDays`.

- [ ] Add to schema:
```ts
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  batchId: uuid("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
  amountInr: integer("amount_inr").notNull(),
  currency: text("currency").notNull().default("INR"),
  razorpayOrderId: text("razorpay_order_id").notNull().unique(),
  razorpayPaymentId: text("razorpay_payment_id"),
  status: text("status").notNull().default("created"), // created | paid | failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
})

export const entitlements = pgTable("entitlements", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  batchId: uuid("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
  source: text("source").notNull().default("purchase"), // purchase | grant
  orderId: uuid("order_id").references(() => orders.id),
  expiresAt: timestamp("expires_at"), // null = lifetime
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({ userBatch: unique().on(t.userId, t.batchId) }))
```
- [ ] Add `accessDays: integer("access_days")` to `batches`.
- [ ] Remove the `plans` table export.
- [ ] Temporarily make profile not reference `plans` (stub the section until Task 6).
- [ ] `npm run db:generate` → migration `0002`.
- [ ] Test: migrate a fresh pglite dir, assert `orders`/`entitlements` queryable, `plans` gone. Run, commit.

---

### Task 2: Gate logic (pure) + query enforcement

**Files:**
- Create: `lib/payments/gate.ts` (pure helpers)
- Modify: `lib/db/queries.ts` (entitlement reads + block locked batch)
- Test: `lib/payments/gate.test.ts`

**Interfaces / Produces:**
```ts
// gate.ts — pure, no db
export function isPaid(batch: { priceInr: number | null }): boolean       // price != null && > 0
export function isLive(ent: { expiresAt: Date | null } | undefined): boolean // ent exists && (expiresAt null || > now)
export function isUnlocked(batch: { priceInr: number | null }, ent: { expiresAt: Date | null } | undefined): boolean
```
```ts
// queries.ts additions
export function getEntitlement(userId: string, batchId: string): Promise<Ent | undefined>
export async function requireUnlockedBatch(batchId: string, examId: string, userId: string) // redirect("/checkout/"+batchId) if paid & not entitled; returns batch
```

- [ ] Test gate: free (price null/0) → unlocked; paid + no ent → locked; paid + live ent → unlocked; paid + expired ent → locked; lifetime ent (expiresAt null) → unlocked.
- [ ] Implement `gate.ts`. Run tests, they pass.
- [ ] `queries.ts`: add `getEntitlement`; in `getSubject`/`getLesson`/subject-list paths, resolve the owning batch and call gate — locked → `redirect("/checkout/"+batchId)`. Replace the `ponytail:` note.
- [ ] Build. Commit.

---

### Task 3: Razorpay client lib

**Files:**
- Create: `lib/payments/razorpay.ts`
- Test: `lib/payments/razorpay.test.ts`

**Produces:**
```ts
export function paymentsConfigured(): boolean               // real keys present
export function mockMode(): boolean                         // !configured && RAZORPAY_MOCK==="1"
export function createRazorpayOrder(amountInr: number, receipt: string, notes: Record<string,string>): Promise<{ id: string }>
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean
export function verifyWebhookSignature(rawBody: string, signature: string): boolean
```

- [ ] Test `verifyPaymentSignature`: build a known HMAC with a test secret via `node:crypto`, assert true; tamper one char → false. Same for webhook.
- [ ] Test mock mode: with `RAZORPAY_MOCK=1` and no keys, `createRazorpayOrder` returns a synthetic `{ id: "order_mock_..." }` without network.
- [ ] Implement using `fetch` (Basic auth `key_id:key_secret`, amount×100 paise) + `crypto.createHmac('sha256',...)` + `crypto.timingSafeEqual`.
- [ ] Run tests, build. Commit.

---

### Task 4: Order-create action + verify/webhook/mock routes

**Files:**
- Create: `lib/payments/actions.ts` (`createCourseOrder(batchId)` server action)
- Create: `app/api/payments/verify/route.ts`
- Create: `app/api/webhooks/razorpay/route.ts`
- Create: `app/api/payments/mock-capture/route.ts` (dev/mock only)
- Create: `lib/payments/grant.ts` (`grantEntitlement` — idempotent upsert)
- Modify: `proxy.ts` (allow the webhook path unauthenticated; keep others gated appropriately)
- Test: `lib/payments/flow.test.ts` (pglite integration)

**Interfaces:**
```ts
// grant.ts
export async function grantEntitlement(opts: { userId: string; batchId: string; orderId?: string; source?: "purchase"|"grant"; accessDays?: number|null }): Promise<void>
// actions.ts
export async function createCourseOrder(batchId: string): Promise<{ orderId: string; amountInr: number; keyId: string | null }>
```

- [ ] `grantEntitlement`: compute `expiresAt = accessDays ? now+days : null`; upsert on `unique(userId,batchId)` — on conflict extend `expiresAt` (later of existing/new; null wins as lifetime). Idempotent.
- [ ] `createCourseOrder`: `requireUser`; load batch scoped to active exam; reject if free or already entitled; snapshot `amountInr`; create razorpay (or mock) order; insert `orders` row `created`; return.
- [ ] verify route: parse body; look up order by `razorpayOrderId`; `verifyPaymentSignature`; on ok mark `paid` + `grantEntitlement` (source purchase, batch.accessDays). Idempotent if already paid.
- [ ] webhook route: read raw body; `verifyWebhookSignature`; on `payment.captured` find order by `notes`/`razorpay_order_id`, mark paid + grant idempotently. Return 200 always after verify (so Razorpay stops retrying) but 400 on bad signature.
- [ ] mock-capture route: only when `mockMode()`; grant directly for the order. 404 otherwise.
- [ ] Integration test (pglite): create order → verify (with a correctly-signed payload) → entitlement live + gate opens; deliver webhook twice → exactly one entitlement; re-purchase with accessDays → expiresAt extended.
- [ ] Build. Commit.

---

### Task 5: Checkout page + locked UI + profile My Courses

**Files:**
- Create: `app/(app)/checkout/[batchId]/page.tsx` (server: loads batch, guards) + `checkout-client.tsx` (Checkout.js + mock button)
- Create: `components/app/price-badge.tsx`, `components/app/lock-overlay.tsx`
- Modify: `components/app/course-card.tsx` (lock badge + price on paid+unowned)
- Modify: dashboard + `app/(app)/batches/[batchId]/page.tsx` (locked → overlay + CTA)
- Modify: `app/profile/page.tsx` ("My courses" from entitlements)
- Modify: `proxy.ts` matcher (add `/checkout`)

- [ ] Price format helper `₹{n.toLocaleString("en-IN")}`.
- [ ] Checkout page: if free or owned → `redirect` to batch. Else render summary + Pay button. Client: on click call `createCourseOrder`, load `https://checkout.razorpay.com/v1/checkout.js`, open modal with `keyId`+`orderId`; on success POST `/api/payments/verify` then `router.push(batch)`. In mock mode show a "Simulate payment (dev)" button POSTing `/api/payments/mock-capture`.
- [ ] Locked course card: lock icon + price, links to `/checkout/[id]`.
- [ ] Batch page: if locked, render lock overlay + "Unlock this course ₹X" CTA instead of subjects.
- [ ] Profile: list entitlements (course name + "Lifetime" or expiry date).
- [ ] Build. Commit.

---

### Task 6: Importer accessDays

**Files:**
- Modify: `lib/content/schema.ts` (batch: `accessDays: z.number().int().positive().optional()`)
- Modify: `lib/content/import.ts` (persist `accessDays`)
- Modify: `docs/superpowers/samples/afcat-sample.json` (+ demo samples: one paid batch with price)
- Test: extend importer test — accessDays round-trips.

- [ ] Add field to zod + loader upsert.
- [ ] Add a priced batch to a demo sample.
- [ ] Run importer tests, build. Commit.

---

### Task 7: Dev harness — paid batch + entitlement scenarios

**Files:**
- Modify: `scripts/dev-pg.mts` (seed one paid batch with `priceInr` + `accessDays`; leave dev-afcat WITHOUT entitlement so locked state shows; add a `dev-session-owner` entitled to it)

- [ ] Seed paid "PRO Batch" (priceInr 9999, accessDays 180) under AFCAT.
- [ ] Add `grantEntitlement` seed for `dev-afcat` on the free batch only; a second entitled dev session for the paid one.
- [ ] Re-seed, note cookies in the header comment.

---

### Task 8: Offline verify sweep + green build

- [ ] `npm run db:local` then run dev on 3007 with `DATABASE_URL=pglite://.pglite` + `RAZORPAY_MOCK=1`.
- [ ] Via chrome-devtools-mcp: locked batch shows lock+price; checkout page renders; mock-capture unlocks → batch subjects visible; direct-URL to a locked subject/lesson redirects to checkout; profile shows the course. Both themes + 375px, contrast AA, no overflow.
- [ ] `vitest run` (all green) + `npm run build` + prod `npm start` smoke.
- [ ] Write `docs/verify/PAYMENTS.md`. Commit.

---

## Post-plan ops (outside TDD loop)

- Update `CLIENT-INPUTS.md`: Razorpay keys + webhook URL + accessDays policy.
- Init git remote, push to GitHub.
- Connect Vercel (needs client's Vercel auth/token + env vars). Public pages live immediately; authed needs Neon + Google OAuth + Razorpay envs.

## Self-review

- Spec coverage: gate rule (T2), access length/accessDays (T1,T6), schema+drop plans (T1), razorpay wiring (T3,T4), mock (T3,T4), pages/UX (T5), profile (T5), security notes (T3,T4), tests (T2,T3,T4,T6), client inputs (ops). ✓
- No placeholders: each task has concrete code/tests. ✓
- Type consistency: `isUnlocked`/`getEntitlement`/`grantEntitlement`/`createCourseOrder` names consistent across T2–T5. ✓
