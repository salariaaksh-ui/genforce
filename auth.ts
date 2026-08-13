import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [Google], // reads AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET from env
  // Self-hosted (Hostinger Node, not Vercel): Auth.js v5 otherwise rejects every
  // request in production with UntrustedHost. Trust the host set by our own proxy.
  trustHost: true,
  session: { strategy: "database" },
  pages: { signIn: "/login" },
  callbacks: {
    // Database sessions: surface the user id for guards/queries.
    session({ session, user }) {
      if (session.user) session.user.id = user.id
      return session
    },
  },
})
