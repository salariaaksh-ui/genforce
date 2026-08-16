import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { GoogleButton } from "@/components/auth/google-button"
import { Logo, LogoMark } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/app/theme-toggle"
import { Reveal } from "@/components/motion/reveal"
import { ScrollProgress } from "@/components/motion/scroll-progress"
import { Aurora } from "@/components/landing/aurora"
import { ExamPreview } from "@/components/landing/exam-preview"

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
      <ScrollProgress />

      {/* Header */}
      <header>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Logo />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="-mx-2 rounded-md px-2 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <Aurora />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
          <div>
            <Reveal onMount>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                AFCAT · NDA · CDS · CAPF
              </p>
            </Reveal>
            {/* Headline renders instantly (LCP element — not gated behind a fade). */}
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl sm:leading-[1.05] md:text-6xl">
              Your climb to the <span className="swash">cut-off</span> starts here.
            </h1>
            <Reveal onMount delay={0.1}>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground">
                Recorded classes from named mentors, timed papers, and study PDFs —
                organised batch by batch so you always know the next thing to do.
              </p>
            </Reveal>
            <Reveal onMount delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <GoogleButton />
                <Link
                  href="#how"
                  className="rounded-md px-1 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  How it works ↓
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal onMount delay={0.15}>
            <ExamPreview />
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-8">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <Reveal>
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              How it works
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, idx) => (
              <Reveal key={s.k} delay={idx * 0.08}>
                <div className="h-full rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40">
                  <span className="font-mono text-sm font-semibold text-primary">{s.k}</span>
                  <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
                  <p className="mt-2 text-muted-foreground">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What's inside */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16">
          <Reveal>
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              What&apos;s inside
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {INSIDE.map(([k, v], idx) => (
              <Reveal key={k} delay={idx * 0.06}>
                <div className="h-full rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40">
                  <p className="text-lg font-semibold">{k}</p>
                  <p className="mt-1 text-muted-foreground">{v}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Exams */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16">
          <Reveal>
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Exams covered
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EXAMS.map(([code, full], idx) => (
              <Reveal key={code} delay={idx * 0.06}>
                <div className="h-full rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40">
                  <p className="text-2xl font-extrabold tracking-tight">{code}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{full}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16">
          <Reveal>
            <div className="flex flex-col items-start gap-6 rounded-3xl bg-primary p-6 text-primary-foreground sm:p-10 md:p-14">
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
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <div className="-mx-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground sm:gap-4">
            <Link href="/privacy" className="rounded-md px-2 py-1.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Privacy</Link>
            <Link href="/terms" className="rounded-md px-2 py-1.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Terms</Link>
            <span className="px-2">© 2026 Genforce</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
