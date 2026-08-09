import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "About",
  description: `Meet the team behind ${siteConfig.name}.`,
  alternates: { canonical: "/about" },
}

const trustSignals = [
  { stat: "TODO", label: "Properties sold" },
  { stat: "TODO", label: "Years in the area" },
  { stat: "TODO", label: "Average days on market" },
]

const testimonials = [
  {
    quote:
      "TODO(client): replace with a genuine client testimonial. Keep it real — never fabricate reviews.",
    name: "Client name",
    detail: "Sold in Suburb",
  },
  {
    quote:
      "TODO(client): a second real testimonial. Recent sales results and honest reviews build trust.",
    name: "Client name",
    detail: "Purchased in Suburb",
  },
]

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid items-center gap-10 md:grid-cols-2">
        {/* Photo slot */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted">
          <Image
            src="/sample/agent-01.jpg"
            alt="Agent portrait — replace with the client's photo"
            fill
            sizes="(min-width: 768px) 400px, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            About {siteConfig.name}
          </h1>
          <div className="mt-4 space-y-4 text-pretty text-muted-foreground">
            <p>
              TODO(client): replace with the agent/agency bio. Who you are, the
              areas you serve, what makes you different, and why sellers and
              buyers should trust you.
            </p>
            <p>
              Keep it genuine and specific — real credentials, real track record,
              real service areas.
            </p>
          </div>
          <div className="mt-6">
            <Link href="/contact" className={cn(buttonVariants())}>
              Get in touch
            </Link>
          </div>
        </div>
      </div>

      {/* Trust signals */}
      <section className="mt-16">
        <h2 className="sr-only">Track record</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {trustSignals.map((s) => (
            <Card key={s.label}>
              <CardContent className="text-center">
                <p className="text-3xl font-bold">{s.stat}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight">What clients say</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <figure key={i} className="rounded-xl border border-border p-6">
              <blockquote className="text-pretty">
                <p>“{t.quote}”</p>
              </blockquote>
              <figcaption className="mt-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t.name}</span> —{" "}
                {t.detail}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  )
}
