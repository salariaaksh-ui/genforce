import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { PropertyCard } from "@/components/listings/property-card"
import { getFeaturedListings } from "@/lib/sample-listings"
import { siteConfig } from "@/lib/site"

export default function HomePage() {
  const featured = getFeaturedListings(3)

  return (
    <>
      {/* Hero — LCP image is preloaded via priority; height reserved (no CLS) */}
      <section className="relative flex min-h-[460px] items-center overflow-hidden md:min-h-[70svh]">
        <Image
          src="/sample/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-xl text-white">
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              {siteConfig.tagline}
            </h1>
            <p className="mt-4 text-pretty text-lg text-white/85">
              {siteConfig.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/listings" className={cn(buttonVariants({ size: "lg" }))}>
                Browse listings
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-white/40 bg-white/10 text-white hover:bg-white/20"
                )}
              >
                Contact agent
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Featured listings
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A selection of current properties.
            </p>
          </div>
          <Link
            href="/listings"
            className="hidden shrink-0 rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline"
          >
            View all →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* Value prop / CTA band */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Thinking of selling?
            </h2>
            <p className="mt-1 max-w-prose text-muted-foreground">
              Get a no-obligation appraisal from a local expert who knows your area.
            </p>
          </div>
          <Link
            href="/contact"
            className={cn(buttonVariants({ size: "lg" }), "shrink-0")}
          >
            Request an appraisal
          </Link>
        </div>
      </section>
    </>
  )
}
