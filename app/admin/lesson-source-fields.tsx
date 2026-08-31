"use client"

import { useState } from "react"
import { FIELD, LABEL } from "./_styles"

const SOURCES = ["youtube", "vimeo", "zoom", "r2"] as const

/**
 * Source + video-source fields for the lesson add/edit forms. For link sources
 * (youtube/vimeo/zoom) it's a plain URL input. For "r2" the admin picks a file
 * that uploads DIRECTLY to R2 via a presigned PUT (bypassing Vercel's 4.5 MB
 * body cap); the resulting object key is written into the hidden `playUrl`
 * field, so the server action stores it exactly like a link. */
export function LessonSourceFields({
  defaultSource = "youtube",
  defaultPlayUrl = "",
}: {
  defaultSource?: string
  defaultPlayUrl?: string
}) {
  const [source, setSource] = useState(defaultSource)
  const [link, setLink] = useState(defaultPlayUrl)
  // For r2, `key` is the stored object key. Prefill only when editing an r2 lesson.
  const [key, setKey] = useState(defaultSource === "r2" ? defaultPlayUrl : "")
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File) {
    setError(null)
    setProgress(0)
    try {
      const res = await fetch("/api/admin/upload-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prefix: "lessons", filename: file.name, contentType: file.type || "video/mp4" }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || `presign failed (${res.status})`)
      const { uploadUrl, key: objKey } = (await res.json()) as { uploadUrl: string; key: string }

      // XHR (not fetch) so we can show upload progress on a 300 MB file.
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("PUT", uploadUrl)
        xhr.setRequestHeader("Content-Type", file.type || "video/mp4")
        xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100))
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`upload failed (${xhr.status})`)))
        xhr.onerror = () => reject(new Error("upload failed — check R2 CORS allows PUT from this origin"))
        xhr.send(file)
      })
      setKey(objKey)
      setProgress(100)
    } catch (e) {
      setError(e instanceof Error ? e.message : "upload failed")
      setProgress(null)
    }
  }

  const isR2 = source === "r2"

  return (
    <>
      <input type="hidden" name="source" value={source} />
      <div>
        <label className={LABEL}>Source</label>
        <select value={source} onChange={(e) => setSource(e.target.value)} className={FIELD}>
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s === "r2" ? "upload (R2)" : s}</option>
          ))}
        </select>
      </div>

      {isR2 ? (
        <div className="sm:col-span-2">
          <label className={LABEL}>Video file *</label>
          <input type="hidden" name="playUrl" value={key} />
          <input
            type="file"
            accept="video/*"
            className={FIELD}
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          {progress !== null && progress < 100 && (
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          {key && progress === 100 && <p className="mt-2 text-xs text-emerald-700">Uploaded ✓ ({key})</p>}
          {key && progress === null && <p className="mt-2 text-xs text-muted-foreground">Current file: {key}</p>}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          {progress !== null && progress < 100 && <p className="mt-1 text-xs text-muted-foreground">Uploading… {progress}% — keep this tab open.</p>}
        </div>
      ) : (
        <div className="sm:col-span-2">
          <label className={LABEL}>Video link *</label>
          <input
            name="playUrl"
            required
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className={FIELD}
            placeholder="https://youtu.be/…  (YouTube unlisted, Vimeo, or Zoom)"
          />
        </div>
      )}
    </>
  )
}
