import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { GoogleButton } from "@/components/auth/google-button"
import { Logo } from "@/components/brand/logo"
import { Reveal } from "@/components/motion/reveal"

export const metadata = { title: "Sign in" }

export default async function Login() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-8 p-8"
    >
      <Reveal onMount>
        <Link href="/" aria-label="Genforce home">
          <Logo />
        </Link>
      </Reveal>
      <Reveal onMount delay={0.08}>
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Sign in to Genforce</h1>
          <p className="text-muted-foreground">
            Pick your exam and pick up where you left off.
          </p>
        </div>
      </Reveal>
      <Reveal onMount delay={0.16}>
        <GoogleButton />
      </Reveal>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>
    </main>
  )
}
