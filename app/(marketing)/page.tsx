import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { GoogleButton } from "@/components/auth/google-button"

export default async function Landing() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-6 p-8 text-center"
    >
      <h1 className="text-4xl font-semibold tracking-tight">Genforce</h1>
      <p className="text-muted-foreground">
        Exam prep for AFCAT, NDA, CDS &amp; CAPF.
      </p>
      <GoogleButton />
    </main>
  )
}
