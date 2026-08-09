# Project CLAUDE.md — starter template

This is the per-project `CLAUDE.md` required by the agency standards (§5: one
`CLAUDE.md` per project — inherit the standards, then append client specifics).

## Standards (inherited)

The agency-wide standards live at the repo root: **`../../CLAUDE.md`**
(`C:\Ai Kaarigar\CLAUDE.md`) with the build workflow in `../../SKILL.md` and the
full reference in `../../REAL-ESTATE-CHECKLIST.md`. Claude Code auto-loads the
root `CLAUDE.md` while this project sits under `C:\Ai Kaarigar\`.

⚠️ If you move a duplicated project OUTSIDE `C:\Ai Kaarigar\`, copy the agency
`CLAUDE.md` / `SKILL.md` in alongside it so the standards travel with the project.

## Next.js version rules

@AGENTS.md

## Client specifics — FILL IN per project

Replace each TODO when you duplicate this template for a client:

- **Brand name / tagline:** see `lib/site.ts` (`siteConfig.name`, `tagline`)
- **Brand colours:** `app/globals.css` → the `BRAND TOKENS` block (`--primary`, `--ring`, …)
- **Fonts:** `app/layout.tsx` (currently Geist) — swap for the client's licensed fonts
- **Logo:** `/public` + the logo slot in `components/site-header.tsx`
- **Listing data source:** `lib/sample-listings.ts` → real JSON / CMS / feed (CLAUDE.md §1)
- **Contact / NAP:** `lib/site.ts` (`siteConfig.contact`) — must match Google Business Profile
- **Form delivery:** Resend, wired in `app/api/contact/route.ts`. Set `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` in `.env.local` (see `.env.example`) and TEST end-to-end
- **Site URL:** `siteConfig.url` (or `NEXT_PUBLIC_SITE_URL`) for canonical/sitemap/OG
- **Situational features scoped in:** (none by default — list here if added)

## Client intake

Copy the agency `intake-template.md` into this project as `intake.md` and fill it
in with the client's answers before building.
