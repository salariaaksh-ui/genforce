import type { Metadata } from "next"

import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Terms",
  description: `Terms of use for the ${siteConfig.name} website.`,
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Use</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        TODO(client): replace with real terms reviewed for your jurisdiction.
        This placeholder is not legal advice.
      </p>
      <div className="mt-6 space-y-4 text-pretty text-muted-foreground">
        <p>
          The content on this website is provided for general information only.
          Course details, schedules, and availability may change without notice.
          Access to paid content is subject to an active subscription.
        </p>
        <p>
          Describe here acceptable use, intellectual property, subscription and
          refund terms, limitation of liability, and the governing law for your
          jurisdiction.
        </p>
      </div>
    </main>
  )
}
