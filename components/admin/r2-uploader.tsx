"use client"

import { useState } from "react"
import { r2PresignUploadAction } from "@/app/admin/actions"
import { FIELD, LABEL } from "@/app/admin/_styles"

type Status = "idle" | "uploading" | "done" | "error"

/** PUT a file to a presigned URL with progress (fetch has no upload progress). */
function putWithProgress(url: string, file: File, onPct: (n: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onPct(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (HTTP ${xhr.status})`))
    xhr.onerror = () => reject(new Error("Network error during upload (check R2 CORS)"))
    xhr.send(file)
  })
}

/**
 * Picks a video file, uploads it straight to R2 via a presigned URL, and writes
 * the resulting object key into a hidden input (default name "playUrl") so the
 * surrounding lesson form submits it like any other value. Pair it with a hidden
 * <input name="source" value="r2" /> in the same form.
 */
export function R2Uploader({ fieldName = "playUrl" }: { fieldName?: string }) {
  const [status, setStatus] = useState<Status>("idle")
  const [pct, setPct] = useState(0)
  const [key, setKey] = useState("")
  const [msg, setMsg] = useState("")

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus("uploading")
    setPct(0)
    setMsg(file.name)
    setKey("")
    try {
      const { url, key } = await r2PresignUploadAction(file.name)
      await putWithProgress(url, file, setPct)
      setKey(key)
      setStatus("done")
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Upload failed")
      setStatus("error")
    }
  }

  return (
    <div>
      <label className={LABEL}>Video file *</label>
      <input
        type="file"
        accept="video/*"
        onChange={onChange}
        disabled={status === "uploading"}
        className={FIELD}
      />
      {status === "uploading" && (
        <p className="mt-1 text-xs text-muted-foreground">Uploading {msg}… {pct}%</p>
      )}
      {status === "done" && (
        <p className="mt-1 text-xs text-green-600 dark:text-green-500">
          Uploaded ✓ — click “Add lesson” to save.
        </p>
      )}
      {status === "error" && <p className="mt-1 text-xs text-red-600 dark:text-red-500">{msg}</p>}
      {/* The stored value: an R2 object key, submitted with the form. */}
      <input type="hidden" name={fieldName} value={key} />
    </div>
  )
}
