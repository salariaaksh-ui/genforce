# Genforce — inputs needed from the client

The site is built. It won't run end-to-end until two things exist: a reachable
Postgres database and Google sign-in credentials. Everything below is a one-time
setup. Nothing in the code changes — you only fill in `.env`.

Until these land, only the **public** pages (landing, login, privacy, terms)
run. All signed-in pages (dashboard, batches, lessons, PDFs, gallery, tests)
need the database and sign-in working first.

---

## 1. Database — `DATABASE_URL`

We recommend **Neon** (free tier, no server to manage): https://neon.tech

1. Create a Neon project → copy the connection string (starts with
   `postgresql://...`, includes `?sslmode=require`).
2. Paste it into `.env`:
   ```
   DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
   ```
3. Create the tables and seed the four exams:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
   `db:migrate` builds the schema. `db:seed` inserts AFCAT / NDA / CDS / CAPF.

> A plain local Postgres works too — but this Windows machine has none running
> (that's why sign-in currently fails). Neon is the least-effort option.

---

## 2. Google sign-in — `AUTH_*`

Sign-in is **Google only** (no password, no OTP). From the Google Cloud
Console → APIs & Services → Credentials → **Create OAuth client ID → Web app**:

- **Authorized redirect URI (dev):** `http://localhost:3007/api/auth/callback/google`
- **Authorized redirect URI (production):** `https://<your-domain>/api/auth/callback/google`

Then fill `.env`:
```
AUTH_SECRET=<run: npx auth secret>
AUTH_GOOGLE_ID=<client id>
AUTH_GOOGLE_SECRET=<client secret>
```

---

## 3. Content — provided later, loaded into the database

The four exams are seeded automatically. Everything a student actually studies
is **content you provide** and we load per exam:

| What            | Fields we need per item                                             |
|-----------------|---------------------------------------------------------------------|
| Batch           | name, cycle (optional), display order                               |
| Subject         | batch it belongs to, name, teacher/mentor name, display order       |
| Lesson (video)  | subject, order no., title, source (Bunny/YouTube/Vimeo/Zoom), embeddable video URL, duration (optional), recorded date (optional) |
| Study PDF       | exam, filename, file URL                                            |
| Gallery image   | exam, image URL                                                     |
| Practice test   | exam, set name, time limit (min), Google Form URL, date (optional)  |

Notes:
- **Video hosting is Bunny Stream (Bunny.net).** In the Bunny dashboard open a
  video → **Embed** and paste the link it shows
  (`https://iframe.mediadelivery.net/play/<library>/<video-id>` or the `…/embed/…`
  form). The player normalizes either to the embeddable form automatically, and
  keeps any `?token=…&expires=…` query if the library has embed-token security on.
- YouTube (unlisted), Vimeo, and Zoom share URLs still work too — just pick the
  matching **source**. In every case paste the **embeddable/share** link, never
  the editor/admin link.
- Practice-test URL must be the **`/viewform`** link, never the form's edit URL.
- PDFs are de-duplicated automatically (same file can't be added twice per exam).

Until content is loaded, every section shows a clean "nothing here yet" state —
by design, no placeholder junk.

---

## 4. Confirm it works (after 1 + 2)

```bash
npm run dev -- -p 3007
```
Open http://localhost:3007 → **Sign in with Google** → pick an exam → you land on
the dashboard. Sections will be empty until content (step 3) is loaded.

---

## 5. Razorpay — course payments (`RAZORPAY_*`)

Paid courses are now locked until purchased. To turn payments on, add a Razorpay
account's keys — until then, paid courses simply stay locked.

From the **Razorpay Dashboard** (start in **Test mode** to trial it safely):

1. **Settings → API Keys → Generate** → copy the Key ID and Key Secret.
2. **Settings → Webhooks → Add** a webhook:
   - URL: `https://<your-domain>/api/webhooks/razorpay`
   - Active event: **`payment.captured`**
   - Copy the **webhook secret** it shows.
3. Fill `.env`:
   ```
   RAZORPAY_KEY_ID=<key id>
   RAZORPAY_KEY_SECRET=<key secret>
   RAZORPAY_WEBHOOK_SECRET=<webhook secret>
   ```

Switch to the **Live** keys when you're ready to take real money.

### Which courses are paid, and for how long

- A course (batch) is **paid** when it has a **price** (`priceInr`) in the content
  file; a course with no price stays **free**.
- Access is **lifetime** by default. To make a course expire, set **`accessDays`**
  on that batch in the content file (e.g. `180` for six months).
- Prices and `accessDays` come in through the same content import as everything
  else (section 3) — no code change needed to reprice.
