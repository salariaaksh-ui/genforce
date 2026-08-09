import Image from "next/image"
import Link from "next/link"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { PropertySpecs } from "@/components/listings/property-specs"
import { StatusBadge } from "@/components/listings/status-badge"
import { formatAddress, formatPrice, heroPhoto } from "@/lib/format"
import type { Property } from "@/lib/types"

/**
 * The most-reused component. Restyle it per client via the brand tokens in
 * globals.css — it uses only semantic tokens (card/primary/muted/border), no
 * literal colours, so a colour swap needs no edits here.
 */
export function PropertyCard({ property }: { property: Property }) {
  const hero = heroPhoto(property)

  return (
    <Card className="group relative overflow-hidden pt-0 transition-shadow focus-within:ring-2 focus-within:ring-ring hover:shadow-md">
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-muted">
        {hero && (
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={property.status} />
        </div>
      </div>

      <CardContent className="space-y-2">
        <p className="text-lg font-semibold">
          {formatPrice(property.price, property.priceQualifier)}
        </p>
        <PropertySpecs property={property} />
        <p className="text-sm text-muted-foreground">{formatAddress(property)}</p>
      </CardContent>

      <CardFooter>
        {/* Stretched link = whole card is clickable, single tab stop */}
        <Link
          href={`/listings/${property.slug}`}
          className="text-sm font-medium text-primary after:absolute after:inset-0 focus-visible:outline-none"
        >
          View details
          <span className="sr-only"> for {formatAddress(property)}</span>
          <span aria-hidden> →</span>
        </Link>
      </CardFooter>
    </Card>
  )
}
