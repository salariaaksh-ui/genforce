/** Streamed fallback while an (app) page fetches. Neutral skeleton, no layout
 *  shift — mirrors the rounded-card rhythm of the real pages. */
export default function Loading() {
  return (
    <div className="animate-pulse space-y-10" aria-hidden="true">
      <div className="h-3 w-32 rounded-full bg-muted" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3 rounded-2xl border bg-card p-6">
            <div className="h-5 w-24 rounded-full bg-muted" />
            <div className="h-3 w-32 rounded-full bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-20 rounded-2xl border bg-card" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}
