import type { Metadata } from "next"

import { PropertyCard } from "@/components/listings/property-card"
import { IS_SAMPLE_DATA, SAMPLE_LISTINGS } from "@/lib/sample-listings"

export const metadata: Metadata = {
  title: "Listings",
  description: "Browse current property listings.",
  alternates: { canonical: "/listings" },
}

export default function ListingsPage() {
  const listings = SAMPLE_LISTINGS

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Listings</h1>
        <p className="mt-2 text-muted-foreground">
          {listings.length} properties available.
        </p>
      </header>

      {IS_SAMPLE_DATA && (
        <p className="mb-6 rounded-md border border-dashed border-border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
          Showing sample data. Replace <code>lib/sample-listings.ts</code> with the
          client&apos;s real listing source before launch.
        </p>
      )}

      {listings.length === 0 ? (
        <p className="rounded-lg border border-border bg-muted/30 p-8 text-center text-muted-foreground">
          No listings available right now. Please check back soon.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
