import { NextResponse } from "next/server"
import { z } from "zod"
import { Resend } from "resend"

/**
 * Enquiry endpoint — delivers via Resend (CLAUDE.md §1 default).
 *
 * Required env (set per client — see .env.example):
 *   RESEND_API_KEY     Resend API key
 *   CONTACT_TO_EMAIL   where enquiries are delivered (the client's inbox)
 *   CONTACT_FROM_EMAIL verified sender in the client's Resend domain
 *
 * If any are missing the endpoint runs in a DEV FALLBACK: it logs a loud
 * warning and returns { ok: true, delivered: false } so the template demo still
 * works locally. Set all three and TEST end-to-end before launch — an
 * undelivered form is the #1 silent launch failure (CLAUDE.md §6).
 */

// Server-side validation — never trust the client (trust boundary).
const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(5000),
  listingRef: z.string().trim().max(60).optional(),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = enquirySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { name, email, phone, message, listingRef } = parsed.data
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL

  const subject = listingRef
    ? `Website enquiry — listing ${listingRef}`
    : "Website enquiry"

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    listingRef ? `Listing: ${listingRef}` : null,
    "",
    message,
  ]
    .filter((l) => l !== null)
    .join("\n")

  // Dev fallback — not configured yet.
  if (!apiKey || !to || !from) {
    console.warn(
      "[contact] RESEND_API_KEY / CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL not all set — enquiry NOT delivered (dev fallback). Configure before launch."
    )
    return NextResponse.json({ ok: true, delivered: false })
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
      replyTo: email, // agent can reply straight to the enquirer
    })
    if (error) {
      console.error("[contact] Resend error:", error)
      return NextResponse.json({ ok: false, error: "Delivery failed" }, { status: 502 })
    }
    return NextResponse.json({ ok: true, delivered: true })
  } catch (err) {
    console.error("[contact] Resend threw:", err)
    return NextResponse.json({ ok: false, error: "Delivery failed" }, { status: 502 })
  }
}
