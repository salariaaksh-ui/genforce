"use client"

/** Admin-section error boundary. Keeps the admin shell (header/nav) and offers a
 *  retry when a content action fails — most commonly a duplicate, i.e. an item
 *  with that name or link already exists for the exam (a unique-constraint
 *  violation) — instead of crashing the whole page to the global error screen. */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[40dvh] flex-col justify-center gap-4">
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-destructive">
          Action failed
        </p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight">That didn&apos;t go through</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          The change couldn&apos;t be saved. If you were adding something, it may already
          exist — a duplicate name or link for this exam. Check the list below, then try again.
        </p>
      </div>
      <button
        onClick={reset}
        className="w-fit rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Try again
      </button>
    </div>
  )
}
