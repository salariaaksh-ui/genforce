import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { GoogleButton } from "@/components/auth/google-button"
import { Logo, LogoMark } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/app/theme-toggle"

const STEPS = [
  {
    k: "01",
    t: "Choose your exam",
    d: "Pick AFCAT, NDA, CDS or CAPF. Your dashboard reshapes around it.",
  },
  {
    k: "02",
    t: "Enter your batch",
    d: "Each batch holds subjects taught by a named mentor, in order.",
  },
  {
    k: "03",
    t: "Learn and revise",
    d: "Watch recorded classes, download PDFs, sit practice papers.",
  },
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
      {/* Header band */}
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
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

      {/* Hero band — left index rail + thesis */}
      <section className="border-b">
        <div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-[4.5rem_1fr]">
          {/* index rail */}
          <div className="hidden border-r md:block">
            <div className="sticky top-0 flex h-full flex-col justify-between py-10 pl-5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Brief</span>
              <span aria-hidden className="space-y-3">
                <span className="block h-px w-3 bg-foreground/40" />
                <span className="block h-px w-5 bg-foreground/40" />
                <span className="block h-px w-8 bg-foreground/40" />
                <span className="block h-px w-6 bg-signal" />
              </span>
              <span className="[writing-mode:vertical-lr]">est. 2026</span>
            </div>
          </div>

          <div className="px-5 py-16 md:py-24">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              AFCAT · NDA · CDS · CAPF
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Recorded classes and a mentor who tracks your climb to{" "}
              <span className="bg-signal px-1.5 text-signal-foreground [box-decoration-break:clone]">
                the cut-off
              </span>
              .
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Batch-by-batch lessons from named teachers, practice papers, and
              study PDFs — organised so you always know the next thing to do.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <GoogleButton />
              <Link
                href="#how"
                className="font-mono text-xs uppercase tracking-widest text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                How it works ↓
              </Link>
            </div>

            {/* drafted hierarchy — honest structure, not a fake stat */}
            <div className="mt-14 max-w-md border-t pt-4 font-mono text-xs text-muted-foreground">
              <p className="tracking-widest text-foreground/70">CONTENT MODEL</p>
              <p className="mt-2 leading-relaxed">
                exam <span className="text-foreground/40">→</span> batch{" "}
                <span className="text-foreground/40">→</span> subject{" "}
                <span className="text-foreground/40">(mentor)</span>{" "}
                <span className="text-foreground/40">→</span> lesson
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — a real 3-step sequence, so the numbering earns its place */}
      <section id="how" className="border-b">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            How it works
          </h2>
          <div className="mt-8 grid gap-px border bg-border sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.k} className="bg-background p-6">
                <span className="font-mono text-sm text-muted-foreground">{s.k}</span>
                <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's inside — hairline ledger rows */}
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            What&apos;s inside
          </h2>
          <dl className="mt-8 divide-y border-y">
            {INSIDE.map(([k, v]) => (
              <div
                key={k}
                className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[16rem_1fr] sm:gap-6"
              >
                <dt className="font-display font-semibold">{k}</dt>
                <dd className="text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Exams */}
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Exams covered
          </h2>
          <div className="mt-8 grid gap-px border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {EXAMS.map(([code, full]) => (
              <div key={code} className="bg-background p-6">
                <p className="font-display text-2xl font-extrabold tracking-tight">
                  {code}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{full}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-b">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-20">
          <LogoMark className="size-8" />
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Sign in and enter your batch.
          </h2>
          <p className="max-w-md text-muted-foreground">
            Free to look around. Sign in with Google to pick your exam and start
            your first lesson.
          </p>
          <GoogleButton />
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <span>© 2026 Genforce</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
