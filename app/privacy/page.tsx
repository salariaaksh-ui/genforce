import type { Metadata } from "next"

import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects and uses your information.`,
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        TODO(client): replace with a real privacy policy reviewed for your
        jurisdiction. This placeholder is not legal advice.
      </p>
      <div className="mt-6 space-y-4 text-pretty text-muted-foreground">
        <p>
          {siteConfig.name} collects the personal information you provide when
          you sign in with Google (such as your name and email) and any details
          you add to your profile, solely to operate your account.
        </p>
        <p>
          We do not sell your information. Describe here what you collect, how
          it&apos;s stored, who it&apos;s shared with, retention periods, and how
          visitors can request access or deletion.
        </p>
        <p>
          Contact:{" "}
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="rounded-sm text-foreground underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {siteConfig.contact.email}
          </a>
        </p>
      </div>
    </main>
  )
}
