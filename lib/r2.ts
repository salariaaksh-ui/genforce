import { AwsClient } from "aws4fetch"

/**
 * Cloudflare R2 (S3-compatible object storage) helper — server only.
 *
 * Videos live in an R2 bucket; the app never serves the raw public URL. Instead
 * a lesson stores the object KEY (e.g. "lessons/<uuid>-class1.mp4") in its video
 * field, and we hand the browser a short-lived *presigned* URL at play time so a
 * copied link dies quickly. R2 has no egress fees, so streaming is effectively
 * free — see CLIENT-INPUTS.md.
 *
 * All of this is gated on four env vars; when any is missing every helper is a
 * no-op (presign* return null, r2Configured() is false) so the app runs fine
 * without R2 — exactly like the Razorpay/DB guards elsewhere. This module is
 * imported only by server code (a server component + a server action); the
 * client uploader calls the action, never this file, so secrets never ship.
 */

type Cfg = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
}

function cfg(): Cfg | null {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.R2_BUCKET
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null
  return { accountId, accessKeyId, secretAccessKey, bucket }
}

/** True when all four R2 env vars are set. */
export function r2Configured(): boolean {
  return cfg() !== null
}

/** Normalize a stored value into a bare object key: strip a leading slash, and
 *  if a full URL was pasted, keep only its path (minus a leading "/<bucket>/"). */
export function r2Key(raw: string, bucket?: string): string {
  let k = raw.trim()
  try {
    k = new URL(k).pathname // was a full URL → keep the path
  } catch {
    // not a URL — treat as a key
  }
  k = k.replace(/^\/+/, "")
  if (bucket && (k === bucket || k.startsWith(`${bucket}/`))) {
    k = k.slice(bucket.length).replace(/^\/+/, "")
  }
  return k
}

async function presign(
  method: "GET" | "PUT",
  rawKey: string,
  expiresSec: number
): Promise<string | null> {
  const c = cfg()
  if (!c) return null
  const key = r2Key(rawKey, c.bucket)
  if (!key) return null
  const aws = new AwsClient({
    accessKeyId: c.accessKeyId,
    secretAccessKey: c.secretAccessKey,
    service: "s3",
    region: "auto",
  })
  const endpoint = `https://${c.accountId}.r2.cloudflarestorage.com`
  const url = new URL(`${endpoint}/${c.bucket}/${key}`)
  url.searchParams.set("X-Amz-Expires", String(expiresSec))
  const signed = await aws.sign(url.toString(), {
    method,
    aws: { signQuery: true },
  })
  return signed.url
}

/** Presigned GET URL for streaming a stored video (default 6h — long enough to
 *  finish a lecture and seek around without the link expiring mid-play). */
export function presignGet(key: string, expiresSec = 6 * 3600): Promise<string | null> {
  return presign("GET", key, expiresSec)
}

/** Presigned PUT URL for a browser→R2 direct upload (default 15 min). */
export function presignPut(key: string, expiresSec = 15 * 60): Promise<string | null> {
  return presign("PUT", key, expiresSec)
}
