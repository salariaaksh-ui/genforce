# Admin Panel — Design Spec

_2026-08-14_

## Goal

Let the Genforce team add/manage content (day-by-day lessons especially) through
the website — no CLI, no code, no file edits. The existing JSON importer stays
for bulk loads; this is the daily self-serve UI.

## Access control

- New route group `app/admin/`.
- `requireAdmin()` — reads the session user, checks their email is in an
  allowlist from env `ADMIN_EMAILS` (comma-separated, case-insensitive). Not in
  the list → redirect to `/dashboard`. Unauthenticated → redirect to `/login`.
- `ADMIN_EMAILS` set in Vercel (and `.env` for dev). Empty/unset = no admins
  (safe default).
- `/admin` added to `robots.ts` disallow and `proxy.ts` protected matcher.

## Entities & operations

All content types, create + edit + delete, admin can act across any exam:

| Entity | Fields (form) | Scope |
|---|---|---|
| Batch | exam, name, cycle, thumbnail (URL), description, priceInr, accessDays, sort | per exam |
| Subject | batch, name, teacher, coverImage (URL), sort | per batch |
| Lesson | subject, idx (auto = max+1), title, source (zoom/vimeo/youtube), playUrl, durationSec, recordedOn, sizeBytes | per subject |
| PDF | exam, filename, url | per exam |
| Test | exam, setName, timeLimitMin, formUrl, formDate | per exam |
| Gallery image | exam, url | per exam |

- **Video = paste a link** (YouTube-unlisted / Vimeo / Zoom). No file upload
  (Vercel can't host video; free path is YouTube-unlisted). `source` gains a
  `youtube` value; the player already renders any playable `playUrl` in an iframe.
- Lesson `idx` auto-assigned (max existing + 1) so the team never manages numbers.
- Delete uses a confirm step; cascades handled by existing FK `onDelete: cascade`.

## Architecture

- **Auth:** `lib/auth/admin.ts` → `requireAdmin()` (wraps existing `requireUser`).
- **Writes:** `lib/db/admin.ts` — thin create/update/delete helpers per entity,
  zod-validated (reuse `lib/content/schema.ts` field validators where possible).
  Admins are trusted, so these are not exam-scoped like the student read layer.
- **Server actions:** `app/admin/actions.ts` — one action per operation, each
  calls `requireAdmin()` first, validates, writes, `revalidatePath`.
- **Pages** (server components, progressive-enhancement forms):
  - `/admin` — hub: exam picker, quick links, counts.
  - `/admin/batches`, `/admin/subjects`, `/admin/lessons`,
    `/admin/pdfs`, `/admin/tests`, `/admin/gallery` — list + add/edit/delete.
- **Styling:** existing DNA (cards, tokens, shadcn button), matches the app shell.

## Non-goals

- No raw video/file hosting (paste links only).
- No per-field audit log, no draft/publish workflow, no rich text.
- No new payment work (Razorpay QR is already handled by the hosted checkout when
  UPI is enabled in the Razorpay dashboard).

## Testing

- Unit: `requireAdmin` allow/deny by email; each write helper (insert/update/
  delete + idx auto-increment) against pglite.
- Verify `/admin` returns redirect for non-admin + unauthenticated (no data leak).
- `next build` clean, lint clean.
