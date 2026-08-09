// needsOnboarding stays pure (no Next/auth/db imports) so it unit-tests in
// isolation. requireUser lazy-imports auth to avoid dragging the db client into
// consumers that only need the pure guard.
export function needsOnboarding(user: { activeExamId: string | null }): boolean {
  return user.activeExamId === null
}

export async function requireUser() {
  const { auth } = await import("@/auth")
  const { redirect } = await import("next/navigation")
  const session = await auth()
  if (!session?.user) redirect("/login")
  return session.user
}
