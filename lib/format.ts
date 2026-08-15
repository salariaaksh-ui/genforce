/** Indian-format rupees, e.g. 9999 → "₹9,999". */
export function formatInr(amountInr: number): string {
  return `₹${amountInr.toLocaleString("en-IN")}`
}

/** Seconds → "1h 6m" or "45 min". Null/0 → null (nothing to show). */
export function formatDuration(sec: number | null | undefined): string | null {
  if (!sec || sec <= 0) return null
  const m = Math.round(sec / 60)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

/** Bytes → "164 MB" / "46 KB". Null/0 → null. */
export function formatFileSize(bytes: number | null | undefined): string | null {
  if (!bytes || bytes <= 0) return null
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${Math.round(bytes / (1024 * 1024))} MB`
}

/** A DB date ("2025-10-22" string or a Date) → "22 Oct 2025". Invalid/null → null. */
export function formatDate(value: string | Date | null | undefined): string | null {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}
