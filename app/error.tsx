"use client"

/** Root-level recoverable error boundary. Covers pages OUTSIDE the (app) group
 *  (profile, onboarding, login, legal, marketing). Without it, an unexpected
 *  failure on those routes bubbles to app/global-error.tsx, which replaces the
 *  entire <html> document with a bare screen; this keeps failures recoverable
 *  and on-brand instead. */
export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-6 px-6 py-24"
    >
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Something went wrong
        </p>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">
          We hit an unexpected error
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          This is usually temporary. Try again in a moment.
        </p>
      </div>
      <button
        onClick={reset}
        className="w-fit rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Try again
      </button>
    </main>
  )
}
