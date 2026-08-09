/** Streamed fallback while an (app) page fetches. Neutral skeleton — no layout
 *  shift, matches the hairline/ledger rhythm of the real pages. */
export default function Loading() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden="true">
      <div className="h-3 w-32 rounded-sm bg-muted" />
      <div className="grid gap-px border bg-border sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3 bg-background p-6">
            <div className="h-5 w-24 rounded-sm bg-muted" />
            <div className="h-3 w-32 rounded-sm bg-muted" />
          </div>
        ))}
      </div>
      <div className="space-y-3 border-y py-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-5 w-2/3 rounded-sm bg-muted" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}
