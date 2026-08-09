"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { siteConfig } from "@/lib/site"
import { buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  // Close the mobile sheet on navigation (incl. browser back). Doing this on
  // route change — not in each link's onClick — avoids racing Base UI's dialog
  // dismissal against Next's client-side navigation in the same tick.
  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo slot — TODO(client): replace text with <Image src="/logo.svg" .../> */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span aria-hidden className="inline-block size-6 rounded bg-primary" />
          <span>{siteConfig.name}</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive(pathname, item.href)
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className={cn(buttonVariants(), "hidden md:inline-flex")}
          >
            Contact agent
          </Link>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "md:hidden"
              )}
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>{siteConfig.name}</SheetTitle>
                <SheetDescription className="sr-only">
                  Main navigation
                </SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile" className="px-4 pb-6">
                <ul className="flex flex-col gap-1">
                  {siteConfig.nav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={
                          isActive(pathname, item.href) ? "page" : undefined
                        }
                        className={cn(
                          "flex h-11 items-center rounded-md px-3 text-base font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isActive(pathname, item.href)
                            ? "bg-muted text-foreground"
                            : "text-foreground"
                        )}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={cn(buttonVariants(), "mt-4 h-11 w-full")}
                >
                  Contact agent
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
