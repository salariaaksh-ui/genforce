import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

/**
 * Cloudflare R2 = S3-compatible object storage with zero egress fees — used to
 * self-host big class recordings (100–500 MB) and PDFs instead of paying for a
 * video host. Two flows:
 *   - upload:   admin browser PUTs the file DIRECTLY to R2 via a presigned URL,
 *               bypassing Vercel's 4.5 MB request-body cap.
 *   - delivery: a short-lived presigned GET URL, minted only after the caller's
 *               course entitlement is verified server-side, played in <video>.
 *
 * Env (set in .env and Vercel — all secret):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
 */

function env(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`${name} is not set — R2 storage is unconfigured`)
  return v
}

/** True when all R2 vars are present, so callers can degrade instead of throwing. */
export function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET,
  )
}

// One lazy client — building it reads env, so don't construct at module load
// (keeps builds/tests green when R2 is unconfigured).
let _client: S3Client | null = null
function client(): S3Client {
  if (_client) return _client
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    },
  })
  return _client
}

/** Presigned PUT URL for a browser to upload one object directly to R2. */
export function presignUpload(key: string, contentType: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(
    client(),
    new PutObjectCommand({ Bucket: env("R2_BUCKET"), Key: key, ContentType: contentType }),
    { expiresIn },
  )
}

/** Presigned GET URL for playback/download. TTL long enough to watch a class,
 *  short enough that a leaked link dies. Mint ONLY after an entitlement check. */
export function presignDownload(key: string, expiresIn = 6 * 3600): Promise<string> {
  return getSignedUrl(
    client(),
    new GetObjectCommand({ Bucket: env("R2_BUCKET"), Key: key }),
    { expiresIn },
  )
}

export async function deleteObject(key: string): Promise<void> {
  await client().send(new DeleteObjectCommand({ Bucket: env("R2_BUCKET"), Key: key }))
}

/** Build a collision-safe object key. `prefix` groups by kind (lessons/pdfs);
 *  the random id avoids leaking titles and prevents overwrites. */
export function objectKey(prefix: string, filename: string): string {
  const ext = filename.includes(".") ? filename.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "") : "bin"
  const id = crypto.randomUUID()
  return `${prefix}/${id}.${ext}`
}

// PDFs and gallery images store their location in a single `url` column with no
// separate source flag, so an R2-hosted object is tagged with this scheme
// prefix. External links (https://…) are stored verbatim. `r2:lessons/…` is the
// stored form; `lessons/…` is the bare S3 key.
export const R2_SCHEME = "r2:"
export const isR2Ref = (v: string | null | undefined): v is string => Boolean(v?.startsWith(R2_SCHEME))
export const toR2Ref = (key: string): string => `${R2_SCHEME}${key}`
export const r2Key = (ref: string): string => (ref.startsWith(R2_SCHEME) ? ref.slice(R2_SCHEME.length) : ref)

/** Resolve a stored `url`/`ref` to something the browser can load: sign R2 refs,
 *  pass external links through. Returns "" for an R2 ref when R2 is unconfigured. */
export function resolveRef(ref: string, expiresIn?: number): Promise<string> | string {
  if (!isR2Ref(ref)) return ref
  if (!r2Configured()) return ""
  return presignDownload(r2Key(ref), expiresIn)
}
