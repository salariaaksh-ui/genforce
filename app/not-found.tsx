import Link from "next/link"
import { Logo } from "@/components/brand/logo"

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-8 px-6 py-24"
    >
      <Logo />
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Error 404
        </p>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Link
        href="/"
        className="w-fit rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Back to home →
      </Link>
    </main>
  )
}
