"use client"

/** Root error boundary. Renders OUTSIDE the app's layout (it replaces the
 *  <html> shell), so it can't rely on globals.css/Tailwind — styles are inline
 *  and self-contained, using the brand palette directly. Covers crashes on the
 *  public pages (landing/login/privacy/terms) that the (app) error boundary
 *  doesn't reach. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#101326",
          color: "#fbfcff",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9a9ec2", margin: 0 }}>
            Something went wrong
          </p>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "0.75rem 0 0.5rem" }}>
            An unexpected error occurred
          </h1>
          <p style={{ color: "#c7cae0", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
            Please try again. If it keeps happening, reload the page.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#5b4fe0",
              color: "#fff",
              border: "none",
              borderRadius: "0.75rem",
              padding: "0.7rem 1.4rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
