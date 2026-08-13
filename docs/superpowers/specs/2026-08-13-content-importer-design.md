# Content Importer — Design

**Date:** 2026-08-13
**Status:** Draft for review
**Scope:** Spec 1 of 3. Sibling specs (later): thumbnails/catalog UX, payments+gate (Razorpay, postponed).

## Problem

Genforce renders empty states until content exists. The client provides content
later. There is no way to load it. We need a repeatable, safe importer that turns
a structured file into database rows for the existing model:

```
Exam (afcat|nda|cds|capf)
  └── Batch (a "course" — e.g. "JULIET BATCH (AFCAT 1 2027)")
        └── Subject (named teacher)
              └── Lesson (video)
+ exam-wide pools: PDFs, Gallery images, Practice tests (G-Forms)
```

## Goals

- One JSON file per exam → validated → loaded into the DB.
- **Idempotent**: re-running the same file makes no duplicates and updates changed fields.
- **Safe**: validate everything before touching the DB; a `--dry` mode reports what would happen without writing.
- Works against the real DB (Neon) or the offline PGlite dev DB — reads `DATABASE_URL`.
- The parse/validate layer is pure and unit-tested with no DB.

## Non-goals (other specs)

- Thumbnails/catalog rendering (Spec 2).
- Payments, per-course entitlement, locking content (Spec 3 — Razorpay postponed).
- An admin UI. This is a CLI the operator runs. (A UI can wrap it later.)

## Schema changes (migration)

Small additions so the importer loads complete course records and so upserts have
natural keys. All additive; production-safe.

- `batches`: add `thumbnail text` (nullable), `description text` (nullable),
  `price_inr integer` (nullable — stored now, shown by nobody until Spec 3),
  and `unique(exam_id, name)`.
- `subjects`: add `unique(batch_id, name)`. (`cover_image` already exists.)
- `gallery_images`: add `unique(exam_id, url)`.
- `test_forms`: add `unique(exam_id, set_name)`.

`lessons` already has `unique(subject_id, idx)`; `pdfs` already has
`unique(exam_id, file_hash)`. No change to those.

## File format

One file = one exam. Client runs the importer once per exam.

```jsonc
{
  "exam": "afcat",                        // required; one of the 4 slugs
  "batches": [
    {
      "name": "JULIET BATCH (AFCAT 1 2027)", // required; unique within exam
      "cycle": "AFCAT 1 2027",               // optional
      "sort": 0,                              // optional (default 0)
      "thumbnail": "/courses/juliet.jpg",     // optional (Spec 2 asset path)
      "priceInr": 2540,                       // optional; stored, unused until Spec 3
      "description": "…",                     // optional
      "subjects": [
        {
          "name": "Maths",                    // required; unique within batch
          "teacher": "Ashish Garg",           // optional
          "coverImage": "/subjects/maths.jpg",// optional
          "sort": 0,                          // optional
          "lessons": [
            {
              "idx": 1,                        // required; unique within subject
              "title": "Percentage Class 1",   // required
              "source": "vimeo",               // required; "zoom" | "vimeo"
              "playUrl": "https://player.vimeo.com/video/…", // playUrl OR playToken required
              "playToken": null,               // optional alternative to playUrl
              "durationSec": 4980,             // optional
              "recordedOn": "2026-03-09",      // optional (YYYY-MM-DD)
              "sizeBytes": 248000000           // optional
            }
          ]
        }
      ]
    }
  ],
  "pdfs":    [ { "filename": "Formula sheet.pdf", "url": "https://…", "fileHash": "…" } ], // fileHash optional
  "gallery": [ { "url": "https://…" } ],
  "tests":   [ { "setName": "Mock 1", "timeLimitMin": 120, "formUrl": "https://…/viewform", "formDate": "2026-01-15" } ]
}
```

`batches`, `pdfs`, `gallery`, `tests` all optional (default `[]`), so partial
imports work (e.g. add only PDFs).

## Validation (zod, pure)

Fails the whole run (nothing written) on any hard error; prints every error at once.

- `exam` ∈ the 4 slugs, else error.
- `batches[].name`, `subjects[].name`, `lessons[].title` non-empty.
- `lessons[].idx` positive integer; unique within its subject (else error naming the dupes).
- `lessons[].source` ∈ {zoom, vimeo}.
- Each lesson has `playUrl` **or** `playToken` (else error — a lesson with no way to play is a data bug).
- `recordedOn` / `formDate` match `YYYY-MM-DD` when present.

Soft **warnings** (printed, do not block):
- `tests[].formUrl` not containing `/viewform` (likely an edit link, per the reference's known flaw).
- A `pdfs[]` entry with no `fileHash` → the importer derives one (see below) and warns.
- `playUrl` that is not an embeddable player URL (heuristic: not `player.vimeo.com` / not a Zoom `rec/share` link).

## Load (idempotent upserts)

Order: exam → batches → subjects → lessons, then the exam-wide pools. Per entity:

- **exam**: looked up by slug; must already exist (the 4 are seeded by `db:seed`). Error if missing.
- **batch**: upsert by `(exam_id, name)`; updates `cycle, sort, thumbnail, price_inr, description`.
- **subject**: upsert by `(batch_id, name)`; updates `teacher, cover_image, sort`.
- **lesson**: upsert by `(subject_id, idx)`; updates `title, source, play_url, play_token, duration_sec, recorded_on, size_bytes`.
- **pdf**: insert, skip on `(exam_id, file_hash)` conflict. `file_hash` = provided value, else `sha256(url)` (stable per URL, so the same URL never double-inserts).
- **gallery**: insert, skip on `(exam_id, url)` conflict.
- **test**: upsert by `(exam_id, set_name)`; updates `time_limit_min, form_url, form_date`.

Nothing is deleted. Removing an item from the JSON does **not** remove its row
(explicit deletes are out of scope; the operator prunes via SQL if needed). This
is called out so re-imports are never surprising.

The load runs inside **one transaction** — a failure rolls back the whole file,
never leaving a half-loaded exam.

## Components

- `lib/content/schema.ts` — zod schema + inferred TS types. Pure. Exports `parseContent(raw): {data, warnings}` (throws a formatted error listing all issues).
- `lib/content/import.ts` — `importContent(db, data): {inserted, updated, skipped}` counts per table. Pure of I/O beyond the passed `db`.
- `scripts/import-content.mts` — CLI. `node --import tsx scripts/import-content.mts <file.json> [--dry]`. Reads + parses the file, prints warnings, and on `--dry` prints the planned counts and exits without writing; otherwise runs `importContent` in a transaction and prints the result.
- `package.json`: `"db:import": "node --env-file=.env --import tsx scripts/import-content.mts"` → `npm run db:import content.json` / `npm run db:import content.json -- --dry`.

## Testing

- `lib/content/schema.test.ts` (vitest, no DB): valid file passes; each hard error triggers (bad exam, dup lesson idx, missing playUrl/token, bad date); each warning fires (non-viewform, missing fileHash). This is the runnable check the logic leaves behind.
- Manual/integration: run `db:import` against the offline PGlite DB with a small sample file, confirm counts, re-run confirms 0 inserts / expected updates, and the authed screens render the imported content.

## Risks / decisions

- **One exam per file** (not multi-exam) — simpler, matches exam-scoped pools. Client runs N times for N exams.
- **`priceInr` stored but unused** until Spec 3 — mild YAGNI, but it lets the client's course data be complete in one import instead of re-importing when payments land.
- **No delete/prune** — keeps re-imports safe and predictable; pruning is a manual SQL step if ever needed.
- **PDF dedupe by `sha256(url)` when no hash given** — deduplicates by URL, not file bytes (we don't have the bytes). Two different URLs of the same file would double-insert; acceptable and documented.
