import { BathIcon, BedDoubleIcon, CarIcon, RulerIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatArea } from "@/lib/format"
import type { Property } from "@/lib/types"

/**
 * Beds / baths / car spaces / area row. Reused on the card and the detail page.
 * Zero-value items are hidden (e.g. a land listing shows only its land area).
 */
export function PropertySpecs({
  property,
  className,
}: {
  property: Property
  className?: string
}) {
  const area = formatArea(property.internalArea) ?? formatArea(property.landArea)

  const items = [
    { icon: BedDoubleIcon, value: property.bedrooms, label: "bedrooms" },
    { icon: BathIcon, value: property.bathrooms, label: "bathrooms" },
    { icon: CarIcon, value: property.carSpaces, label: "car spaces" },
  ].filter((i) => i.value > 0)

  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground",
        className
      )}
    >
      {items.map(({ icon: Icon, value, label }) => (
        <li key={label} className="flex items-center gap-1.5">
          <Icon className="size-4" aria-hidden />
          <span>
            {value}
            <span className="sr-only"> {label}</span>
          </span>
        </li>
      ))}
      {area && (
        <li className="flex items-center gap-1.5">
          <RulerIcon className="size-4" aria-hidden />
          <span>
            {area}
            <span className="sr-only"> area</span>
          </span>
        </li>
      )}
    </ul>
  )
}
