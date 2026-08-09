import Link from "next/link"

import { fullAddress, siteConfig } from "@/lib/site"

export function SiteFooter() {
  const { contact } = siteConfig
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold">{siteConfig.name}</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            {siteConfig.tagline}
          </p>
        </div>

        {/* Contact / NAP slot — must match Google Business Profile exactly */}
        <div>
          <h2 className="text-sm font-semibold">Contact</h2>
          <address className="mt-3 space-y-1 text-sm text-muted-foreground not-italic">
            <p>{fullAddress()}</p>
            <p>
              <a
                href={contact.phoneHref}
                className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {contact.phone}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${contact.email}`}
                className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {contact.email}
              </a>
            </p>
          </address>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {year} {siteConfig.name}. {contact.licenceNumber}.
          </p>
          <ul className="flex gap-4">
            {siteConfig.legal.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
