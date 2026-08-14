import type { Metadata } from "next"

import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects and uses your information.`,
  alternates: { canonical: "/privacy" },
}

// ponytail: generic policy that accurately reflects the app's current data
// flows (Google sign-in, Postgres storage, Razorpay payments). The client must
// have their own counsel review it for their jurisdiction before public launch.
export default function PrivacyPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 14 August 2026</p>

      <div className="mt-8 space-y-8 text-pretty leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <p>
            This policy explains how {siteConfig.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects,
            uses, and protects your personal information when you use our website and learning
            platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Information we collect</h2>
          <p>
            When you sign in with Google, we receive your name, email address, and profile picture
            from your Google account. We also store information you add to your profile and records
            of the courses you access or purchase.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">How we use it</h2>
          <p>
            We use this information solely to create and operate your account, deliver the courses
            and content you are entitled to, process purchases, and provide support. We do not sell
            your personal information or share it for advertising.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Payments</h2>
          <p>
            Course payments are processed by our payment provider (Razorpay). We do not receive or
            store your full card or banking details; those are handled directly by the payment
            provider under their own security standards.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Storage, security &amp; retention</h2>
          <p>
            Your data is stored in a secured, access-controlled database and transmitted over
            encrypted (HTTPS) connections. We retain your account information for as long as your
            account is active, and remove it on request or a reasonable period after your account is
            closed, except where we must keep records to meet legal or accounting obligations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Your rights</h2>
          <p>
            You can request access to, correction of, or deletion of your personal information at any
            time by contacting us. We will respond within a reasonable timeframe.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Changes &amp; contact</h2>
          <p>
            We may update this policy from time to time; the &ldquo;last updated&rdquo; date above
            reflects the latest version. For any privacy question or request, contact us at{" "}
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
