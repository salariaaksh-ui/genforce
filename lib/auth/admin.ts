import { requireUser } from "./guards"

/** Admin allowlist from env `ADMIN_EMAILS` (comma-separated, case-insensitive).
 *  Unset/empty = nobody is an admin (safe default). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

/** Pure allow-check — unit-testable by setting process.env.ADMIN_EMAILS. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return adminEmails().includes(email.toLowerCase())
}

/** Gate for every admin page/action. Unauthenticated → /login (via requireUser);
 *  signed in but not on the allowlist → /dashboard (no admin data leaks). */
export async function requireAdmin() {
  const user = await requireUser()
  if (!isAdminEmail(user.email)) {
    const { redirect } = await import("next/navigation")
    redirect("/dashboard")
    throw new Error("unreachable")
  }
  return user
}
