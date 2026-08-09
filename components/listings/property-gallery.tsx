"use client"

import Image from "next/image"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { Photo } from "@/lib/types"

/**
 * Listing photo gallery. One photo per slide (no horizontal overflow on
 * mobile). The first slide is the LCP hero → `priority` (never lazy-loaded).
 * Arrows are positioned INSIDE the frame so they never cause horizontal scroll.
 */
export function PropertyGallery({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) return null

  return (
    <Carousel className="w-full" opts={{ loop: photos.length > 1 }}>
      <CarouselContent>
        {photos.map((photo, i) => (
          <CarouselItem key={photo.src}>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 768px, 100vw"
                className="object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {photos.length > 1 && (
        <>
          <CarouselPrevious className="left-3 bg-background/80" />
          <CarouselNext className="right-3 bg-background/80" />
        </>
      )}
    </Carousel>
  )
}
