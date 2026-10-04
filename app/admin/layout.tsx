import type { Metadata } from "next"
import Link from "next/link"
import { requireAdmin } from "@/lib/auth/admin"

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
}

const NAV: [string, string][] = [
  ["Overview", "/admin"],
  ["Batches", "/admin/batches"],
  ["Subjects", "/admin/subjects"],
  ["Lessons", "/admin/lessons"],
  ["PDFs", "/admin/pdfs"],
  ["Tests", "/admin/tests"],
  ["Gallery", "/admin/gallery"],
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin() // gates every /admin/* page in one place

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">Genforce Admin</span>
          <nav className="-mx-2 flex flex-wrap gap-x-1 gap-y-1 text-sm">
            {NAV.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link
            href="/dashboard"
            className="ml-auto rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View site →
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
