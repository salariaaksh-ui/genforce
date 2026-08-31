import { Clock } from "lucide-react"
import { offerActive, offerEndsAt, OFFER_PERCENT } from "@/lib/offer"
import { Countdown } from "./countdown"

/** Early-bird offer strip. Renders only while the campaign is live. */
export function OfferBanner() {
  const end = offerEndsAt()
  if (!offerActive() || !end) return null
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl border border-primary/30 bg-primary/10 px-5 py-3 text-center text-sm">
      <Clock className="size-4 flex-none text-primary" aria-hidden />
      <span className="font-semibold text-foreground">
        Early birds get {OFFER_PERCENT}% off
      </span>
      <span className="text-muted-foreground">— 24 hours only, ends in</span>
      <span className="text-primary">
        <Countdown endsAt={end.toISOString()} />
      </span>
    </div>
  )
}
