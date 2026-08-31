import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { isAdminEmail } from "@/lib/auth/admin"
import { presignUpload, objectKey, r2Configured } from "@/lib/storage/r2"

/**
 * Mint a presigned PUT URL so an admin's browser uploads a big file DIRECTLY to
 * R2 (Vercel routes cap request bodies at 4.5 MB — a 300 MB class recording
 * can't proxy through here). The route only signs; no bytes pass through it.
 *
 * POST { prefix: "lessons"|"pdfs", filename, contentType } → { uploadUrl, key }
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  if (!r2Configured()) {
    return NextResponse.json({ error: "R2 storage is not configured" }, { status: 503 })
  }

  const body = (await req.json().catch(() => null)) as
    | { prefix?: string; filename?: string; contentType?: string }
    | null
  const filename = body?.filename?.trim()
  const contentType = body?.contentType?.trim()
  // Allowlist the prefix — never trust it into the key (path-traversal guard).
  const ALLOWED = ["lessons", "pdfs", "gallery"] as const
  const prefix = (ALLOWED as readonly string[]).includes(body?.prefix ?? "") ? body!.prefix! : "lessons"
  if (!filename || !contentType) {
    return NextResponse.json({ error: "filename and contentType are required" }, { status: 400 })
  }

  const key = objectKey(prefix, filename)
  const uploadUrl = await presignUpload(key, contentType)
  return NextResponse.json({ uploadUrl, key })
}
