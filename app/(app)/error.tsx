"use client"

/** Catches render/data failures inside the (app) group (e.g. the DB is
 *  unreachable) so a student sees a recoverable message, not a crash. */
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50dvh] flex-col justify-center gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Something went wrong
        </p>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">
          We couldn&apos;t load this page
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          This is usually temporary. Try again in a moment.
        </p>
      </div>
      <button
        onClick={reset}
        className="w-fit rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Try again
      </button>
    </div>
  )
}
