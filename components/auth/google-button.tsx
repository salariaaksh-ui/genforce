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
        className="inline-flex items-center gap-2.5 rounded-sm bg-primary px-5 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21.35 11.1H12v3.83h5.35c-.23 1.5-1.62 4.4-5.35 4.4-3.22 0-5.85-2.66-5.85-5.94S8.78 7.45 12 7.45c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.7 4.86 14.55 4 12 4 6.98 4 2.9 8.06 2.9 13.1S6.98 22.2 12 22.2c6.2 0 8.9-4.36 8.9-6.62 0-.45-.05-.8-.12-1.14z"
          />
        </svg>
        Sign in with Google
      </button>
    </form>
  )
}
