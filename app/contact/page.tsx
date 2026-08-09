import type { Metadata } from "next"
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { InquiryForm } from "@/components/inquiry-form"
import { MapEmbedSlot } from "@/components/map-embed-slot"
import { fullAddress, siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.name}.`,
  alternates: { canonical: "/contact" },
}

export default function ContactPage() {
  const { contact } = siteConfig

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact</h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Have a question about a property or thinking of selling? Send us a
          message and we&apos;ll get back to you.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="max-w-xl">
          <InquiryForm />
        </div>

        <aside className="space-y-6">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <PhoneIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <a
                href={contact.phoneHref}
                className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {contact.phone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MailIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <a
                href={`mailto:${contact.email}`}
                className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {contact.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <address className="not-italic">{fullAddress()}</address>
            </li>
          </ul>

          <MapEmbedSlot address={fullAddress()} />
        </aside>
      </div>
    </div>
  )
}
