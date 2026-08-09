import { Badge } from "@/components/ui/badge"
import { statusLabel } from "@/lib/format"
import type { ListingStatus } from "@/lib/types"

const VARIANT: Record<
  ListingStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  "for-sale": "default",
  "under-offer": "secondary",
  "under-contract": "secondary",
  sold: "destructive",
  leased: "destructive",
  "off-market": "outline",
}

/** Status badge — the guard against a stale "For Sale" on a sold property. */
export function StatusBadge({ status }: { status: ListingStatus }) {
  return <Badge variant={VARIANT[status]}>{statusLabel(status)}</Badge>
}
