"use client"

import { useState } from "react"
import { FIELD, LABEL } from "./_styles"

/**
 * A single "location" form field that can be either a pasted external link or a
 * file uploaded directly to R2 (presigned PUT → the browser sends the bytes, not
 * Vercel). The stored value written into the hidden input[name] is:
 *   - the URL as typed, for a link, or
 *   - "r2:<object key>", for an upload (see lib/storage/r2.ts R2_SCHEME).
 * The server action stores it verbatim; delivery pages resolve it with resolveRef.
 */
export function FileField({
  name,
  label,
  prefix,
  accept,
  placeholder,
  defaultValue = "",
}: {
  name: string
  label: string
  prefix: "pdfs" | "gallery"
  accept: string
  placeholder?: string
  defaultValue?: string
}) {
  const isStoredUpload = defaultValue.startsWith("r2:")
  const [mode, setMode] = useState<"link" | "upload">(isStoredUpload ? "upload" : "link")
  const [link, setLink] = useState(isStoredUpload ? "" : defaultValue)
  const [ref, setRef] = useState(isStoredUpload ? defaultValue : "")
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File) {
    setError(null)
    setProgress(0)
    try {
      const res = await fetch("/api/admin/upload-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prefix, filename: file.name, contentType: file.type || "application/octet-stream" }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || `presign failed (${res.status})`)
      const { uploadUrl, key } = (await res.json()) as { uploadUrl: string; key: string }
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("PUT", uploadUrl)
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream")
        xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100))
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`upload failed (${xhr.status})`)))
        xhr.onerror = () => reject(new Error("upload failed — check R2 CORS allows PUT from this origin"))
        xhr.send(file)
      })
      setRef(`r2:${key}`)
      setProgress(100)
    } catch (e) {
      setError(e instanceof Error ? e.message : "upload failed")
      setProgress(null)
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className={LABEL}>{label} *</label>
        <div className="flex gap-1 font-mono text-[11px] uppercase tracking-widest">
          <button type="button" onClick={() => setMode("link")} className={mode === "link" ? "text-primary" : "text-muted-foreground"}>Link</button>
          <span className="text-muted-foreground">/</span>
          <button type="button" onClick={() => setMode("upload")} className={mode === "upload" ? "text-primary" : "text-muted-foreground"}>Upload</button>
        </div>
      </div>

      {mode === "link" ? (
        <input name={name} required value={link} onChange={(e) => setLink(e.target.value)} className={FIELD} placeholder={placeholder} />
      ) : (
        <>
          <input type="hidden" name={name} value={ref} />
          <input type="file" accept={accept} className={FIELD} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          {progress !== null && progress < 100 && (
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          {ref && progress === 100 && <p className="mt-2 text-xs text-emerald-700">Uploaded ✓</p>}
          {ref && progress === null && <p className="mt-2 truncate text-xs text-muted-foreground">Current: {ref}</p>}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          {progress !== null && progress < 100 && <p className="mt-1 text-xs text-muted-foreground">Uploading… {progress}% — keep this tab open.</p>}
        </>
      )}
    </div>
  )
}
