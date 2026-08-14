import type { Metadata } from "next"

import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Terms",
  description: `Terms of use for the ${siteConfig.name} website.`,
  alternates: { canonical: "/terms" },
}

// ponytail: generic terms reflecting how the platform actually works (accounts,
// per-course paid access). The client must have their own counsel review and set
// refund/governing-law specifics for their jurisdiction before public launch.
export default function TermsPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Use</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 14 August 2026</p>

      <div className="mt-8 space-y-8 text-pretty leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <p>
            These terms govern your use of the {siteConfig.name} website and learning platform. By
            creating an account or accessing our content, you agree to them.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Accounts</h2>
          <p>
            You are responsible for the activity on your account and for keeping your sign-in secure.
            Accounts are for individual use and may not be shared.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Access &amp; payments</h2>
          <p>
            Some courses are free and some require payment. Paid access is granted for the course and
            duration shown at checkout and is personal to your account. Course details, schedules, and
            availability may change without notice. Refund eligibility, where applicable, is described
            at the point of purchase.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Acceptable use</h2>
          <p>
            You may not copy, record, redistribute, resell, or publicly share the course materials,
            nor attempt to circumvent access controls. Course content is provided for your personal
            study only.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Intellectual property</h2>
          <p>
            All course materials, videos, notes, and branding on this platform are owned by
            {" "}
            {siteConfig.name} or its licensors and are protected by applicable law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Disclaimer &amp; liability</h2>
          <p>
            The content is provided for general educational purposes and we make no guarantee of any
            particular examination result or outcome. To the extent permitted by law, we are not
            liable for indirect or consequential loss arising from use of the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Changes &amp; contact</h2>
          <p>
            We may update these terms from time to time; continued use after an update means you
            accept the revised terms. Questions? Contact us at{" "}
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="rounded-sm text-foreground underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {siteConfig.contact.email}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
