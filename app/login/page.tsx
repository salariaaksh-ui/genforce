import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { GoogleButton } from "@/components/auth/google-button"

export const metadata = { title: "Sign in" }

export default async function Login() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-6 p-8"
    >
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <GoogleButton />
    </main>
  )
}
