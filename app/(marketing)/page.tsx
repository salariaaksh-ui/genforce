import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { GoogleButton } from "@/components/auth/google-button"
import { Logo, LogoMark } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/app/theme-toggle"

const STEPS = [
  { k: "01", t: "Choose your exam", d: "Pick AFCAT, NDA, CDS or CAPF. Your dashboard reshapes around it." },
  { k: "02", t: "Enter your batch", d: "Each batch holds subjects taught by a named mentor, in order." },
  { k: "03", t: "Learn and revise", d: "Watch recorded classes, download PDFs, sit practice papers." },
]

const INSIDE = [
  ["Recorded classes", "Subject by subject, taught by named teachers."],
  ["Study PDFs", "Notes and papers — searchable, no duplicates."],
  ["Practice tests", "Timed question sets with set names and limits."],
  ["Image gallery", "Reference sheets and question snaps."],
]

const EXAMS = [
  ["AFCAT", "Air Force Common Admission Test"],
  ["NDA", "National Defence Academy"],
  ["CDS", "Combined Defence Services"],
  ["CAPF", "Central Armed Police Forces"],
]

export default async function Landing() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <main id="main-content" className="min-h-dvh">
      {/* Header */}
      <header>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Logo />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — text + product-preview bento */}
      <section>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              AFCAT · NDA · CDS · CAPF
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">
              Your climb to the <span className="swash">cut-off</span> starts here.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Recorded classes from named mentors, timed papers, and study PDFs —
              organised batch by batch so you always know the next thing to do.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <GoogleButton />
              <Link
                href="#how"
                className="font-mono text-xs uppercase tracking-widest text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                How it works ↓
              </Link>
            </div>
          </div>

          {/* Product preview — illustrative, generic labels (no fake data) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex items-center gap-4 rounded-2xl bg-primary p-6 text-primary-foreground">
              <span
                aria-hidden
                className="grid size-14 flex-none place-items-center rounded-full"
                style={{ background: "conic-gradient(var(--signal) 66%, rgba(255,255,255,.22) 0)" }}
              >
                <span className="grid size-10 place-items-center rounded-full bg-primary font-mono text-xs">
                  ▶
                </span>
              </span>
              <div>
                <p className="font-semibold">Continue your batch</p>
                <p className="text-sm opacity-80">Pick up at the next lesson</p>
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <p className="text-2xl font-bold">PDFs</p>
              <p className="mt-1 text-sm text-muted-foreground">No duplicates</p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <p className="text-2xl font-bold">Timed</p>
              <p className="mt-1 text-sm text-muted-foreground">Practice papers</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-8">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            How it works
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.k} className="rounded-2xl border bg-card p-6">
                <span className="font-mono text-sm font-semibold text-primary">{s.k}</span>
                <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's inside */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            What&apos;s inside
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {INSIDE.map(([k, v]) => (
              <div key={k} className="rounded-2xl border bg-card p-6">
                <p className="text-lg font-semibold">{k}</p>
                <p className="mt-1 text-muted-foreground">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exams */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Exams covered
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EXAMS.map(([code, full]) => (
              <div key={code} className="rounded-2xl border bg-card p-6">
                <p className="text-2xl font-extrabold tracking-tight">{code}</p>
                <p className="mt-1 text-sm text-muted-foreground">{full}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex flex-col items-start gap-6 rounded-3xl bg-primary p-10 text-primary-foreground md:p-14">
            <LogoMark className="size-8" />
            <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              Sign in and enter your batch.
            </h2>
            <p className="max-w-md opacity-85">
              Free to look around. Sign in with Google to pick your exam and start
              your first lesson.
            </p>
            <GoogleButton tone="onPrimary" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <span>© 2026 Genforce</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
