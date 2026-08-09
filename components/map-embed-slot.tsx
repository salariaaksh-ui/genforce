import { MapPinIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Map placeholder. Shows the plain-text address (a11y + always useful) next to
 * a reserved box for the embed. Ship WITHOUT a live iframe by default — an
 * embedded map needs an API key and hurts LCP.
 *
 * TODO(client): drop the client's Google Maps embed (or a static map image)
 * inside the reserved box. Lazy-load it (`loading="lazy"`) so it never blocks
 * the LCP, and keep the plain-text address visible alongside it.
 */
export function MapEmbedSlot({
  address,
  className,
}: {
  address: string
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="flex items-start gap-2 text-sm">
        <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span>{address}</span>
      </p>
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-center text-sm text-muted-foreground">
        <span className="px-4">
          Map embed slot — add the client&apos;s map here (lazy-loaded).
        </span>
      </div>
    </div>
  )
}
