import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PropertyGallery } from "@/components/listings/property-gallery"
import { PropertySpecs } from "@/components/listings/property-specs"
import { StatusBadge } from "@/components/listings/status-badge"
import { MapEmbedSlot } from "@/components/map-embed-slot"
import { InquiryForm } from "@/components/inquiry-form"
import {
  SAMPLE_LISTINGS,
  getSampleListingBySlug,
} from "@/lib/sample-listings"
import { siteConfig } from "@/lib/site"
import {
  formatAddress,
  formatPrice,
  heroPhoto,
  statusLabel,
} from "@/lib/format"
import type { Property } from "@/lib/types"

// Pre-render every sample listing at build time.
export function generateStaticParams() {
  return SAMPLE_LISTINGS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const property = getSampleListingBySlug(slug)
  if (!property) return {}

  const title = `${formatAddress(property)} — ${statusLabel(property.status)}`
  const hero = heroPhoto(property)
  return {
    title,
    description: property.description.slice(0, 155),
    alternates: { canonical: `/listings/${property.slug}` },
    openGraph: {
      title,
      description: property.description.slice(0, 155),
      images: hero ? [hero.src] : undefined,
    },
  }
}

function listingJsonLd(property: Property) {
  const a = property.address
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: formatAddress(property),
    description: property.description,
    url: `${siteConfig.url}/listings/${property.slug}`,
    image: property.photos.map((p) => `${siteConfig.url}${p.src}`),
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      addressLocality: a.suburb,
      addressRegion: a.state,
      postalCode: a.postcode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.geo.lat,
      longitude: property.geo.lng,
    },
    ...(property.price != null && {
      offers: {
        "@type": "Offer",
        price: property.price,
        priceCurrency: "AUD",
        availability:
          property.status === "sold" || property.status === "leased"
            ? "https://schema.org/SoldOut"
            : "https://schema.org/InStock",
      },
    }),
  }
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const property = getSampleListingBySlug(slug)
  if (!property) notFound()

  const inspectionFmt = new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd(property)) }}
      />

      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <Link href="/listings" className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          ← Back to listings
        </Link>
      </nav>

      <PropertyGallery photos={property.photos} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Details */}
        <div className="space-y-8">
          <div className="space-y-3">
            <StatusBadge status={property.status} />
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {formatAddress(property)}
            </h1>
            <p className="text-xl font-semibold">
              {formatPrice(property.price, property.priceQualifier)}
            </p>
            <PropertySpecs property={property} className="text-base" />
          </div>

          <section>
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-2 whitespace-pre-line text-pretty text-muted-foreground">
              {property.description}
            </p>
          </section>

          {property.features.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold">Features</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {property.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span aria-hidden className="size-1.5 rounded-full bg-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {property.inspectionTimes.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold">Inspection times</h2>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {property.inspectionTimes.map((t) => (
                  <li key={t.start}>
                    <time dateTime={t.start}>
                      {inspectionFmt.format(new Date(t.start))}
                    </time>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold">Location</h2>
            <MapEmbedSlot address={formatAddress(property)} className="mt-3" />
          </section>
        </div>

        {/* Sticky enquiry sidebar */}
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-xl border border-border p-5">
            <h2 className="text-lg font-semibold">Enquire about this property</h2>

            <ul className="mt-4 space-y-3">
              {property.agents.map((agent) => (
                <li key={agent.id} className="flex items-center gap-3">
                  <Avatar>
                    {agent.photo && <AvatarImage src={agent.photo} alt="" />}
                    <AvatarFallback>
                      {agent.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-muted-foreground">{agent.title}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <InquiryForm
                listingRef={property.id}
                listingLabel={formatAddress(property)}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
