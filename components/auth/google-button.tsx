import { signIn } from "@/auth"

export function GoogleButton() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("google", { redirectTo: "/" })
      }}
    >
      <button
        type="submit"
        className="rounded-md border px-4 py-2 font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Sign in with Google
      </button>
    </form>
  )
}
