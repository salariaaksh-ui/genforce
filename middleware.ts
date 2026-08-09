import { NextResponse, type NextRequest } from "next/server"

// Auth.js database sessions can't be validated on the Edge runtime, so the
// middleware only gates on the presence of the session cookie (cheap, edge-safe).
// Real validation happens in each protected page/layout via auth() (Node + DB).
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"]

export function middleware(req: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => req.cookies.has(name))
  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/profile/:path*"],
}
