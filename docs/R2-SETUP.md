# Cloudflare R2 — self-hosted lesson videos & PDFs

Genforce can host big class recordings (100–500 MB) and PDFs on **Cloudflare R2**
(S3-compatible object storage, **zero egress fees**) instead of paying a video
host. Videos upload straight from the admin's browser to R2 and play back through
short-lived signed URLs, gated by the same per-course entitlement check as every
lesson page.

R2 is **optional**. With the four env vars unset, R2 upload/playback is simply
off and link sources (YouTube unlisted / Vimeo / Zoom) keep working exactly as
before.

---

## What's already built

- `lib/storage/r2.ts` — S3 client + presigned upload/download helpers + a
  `resolveRef()` that signs R2 refs and passes external links through.
- `POST /api/admin/upload-url` — admin-only; mints a presigned PUT so the browser
  uploads **directly** to R2 (Vercel routes cap bodies at 4.5 MB — a 300 MB file
  can't proxy through the server). Prefixes allow-listed: `lessons`, `pdfs`,
  `gallery`.
- **Lessons** — Admin → Lessons form has a source **"upload (R2)"**; pick a file,
  it uploads with a progress bar. The lesson page mints a 6-hour signed URL
  (only after the per-course entitlement check passes) and streams it in a
  native `<video>` player. Link sources (YouTube/Vimeo/Zoom) still work.
- **PDFs & gallery** — each admin form has a **Link / Upload** toggle. Uploads go
  straight to R2; the pdf list and gallery page sign the URL per view. External
  links keep working unchanged.

Everything private is served by a per-view signed URL that expires — nothing is
exposed publicly, and paid lesson videos are additionally locked to buyers of
that course.

---

## One-time Cloudflare setup (you do this — I can't enter secret keys)

1. **Create a bucket**
   Cloudflare dashboard → **R2** → *Create bucket*. Name it e.g. `genforce-media`.
   Pick a location hint near your users (APAC / India).

2. **Create an API token**
   R2 → **Manage R2 API Tokens** → *Create API Token*.
   - Permission: **Object Read & Write**
   - Scope: **this bucket only** (`genforce-media`)
   - Create → copy the **Access Key ID** and **Secret Access Key** (shown once).

3. **Grab the Account ID**
   It's on the R2 overview page (right-hand side / bucket settings).

4. **Set the CORS policy on the bucket** (required for browser uploads)
   Bucket → **Settings** → **CORS Policy** → paste, replacing the origins with
   your real domains:

   ```json
   [
     {
       "AllowedOrigins": [
         "https://genforce-sooty.vercel.app",
         "http://localhost:3007"
       ],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["content-type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

   Without this, uploads fail with a CORS error (the app shows
   *"check R2 CORS allows PUT from this origin"*). Playback needs **no** CORS —
   `<video>` loads the signed URL as a normal media request.

---

## Env vars

Add these four (all secret) to `.env` locally and to **Vercel → Settings →
Environment Variables** (Production + Preview). In Vercel, store each as
**Sensitive**.

```
R2_ACCOUNT_ID=<account id>
R2_ACCESS_KEY_ID=<access key id>
R2_SECRET_ACCESS_KEY=<secret access key>
R2_BUCKET=genforce-media
```

Redeploy after setting them. I set env vars I can (non-secret) and redeploy;
**secret keys you paste yourself** — I never handle credentials.

---

## How the team uses it

Admin → **Lessons** → pick the subject → *Add a lesson* → **Source: upload (R2)**
→ choose the video file. Wait for **Uploaded ✓** (keep the tab open during
upload), fill title/date/duration/size, **Add lesson**. Done — the lesson now
streams from R2, locked to buyers of that course.

Existing YouTube/Vimeo/Zoom lessons are untouched; mix and match freely. PDFs
and gallery images work the same way — use the **Upload** toggle on their admin
forms, or paste an external link.

**Deleting** a lesson/PDF/image removes it from the site immediately but leaves
the file in the R2 bucket (a cheap orphan). Clear old files from the Cloudflare
R2 dashboard if storage ever needs tidying.

---

## Limits / future work

- **Single-PUT upload, up to 5 GB per file**, no resume. If a big upload drops
  mid-way it must restart. Add multipart/resumable upload only if that becomes a
  real pain (`ponytail:` note in `lesson-source-fields.tsx`).
- **Signed URLs are shareable while valid** (6 h). Same trade-off as the old
  YouTube-unlisted links; good enough. True anti-piracy (per-segment HLS tokens,
  DRM) is a much bigger build — only if the client demands it.
- **No transcoding** — R2 stores what you upload. Upload a web-friendly MP4
  (H.264/AAC). A 2-hour class at 480–720p is the sweet spot for size vs quality.
