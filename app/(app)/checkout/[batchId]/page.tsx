import { notFound, redirect } from "next/navigation"
import { Check, ShieldCheck } from "lucide-react"
import { requireActiveExam, getBatch, getEntitlement } from "@/lib/db/queries"
import { isPaid, isLive } from "@/lib/payments/gate"
import { formatInr } from "@/lib/format"
import { offerActive, discountedInr } from "@/lib/offer"
import { Breadcrumbs } from "@/components/app/breadcrumbs"
import { Reveal } from "@/components/motion/reveal"
import { OfferBanner } from "@/components/offer/offer-banner"
import { CheckoutButton } from "./checkout-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ batchId: string }>
}) {
  const { batchId } = await params
  const { examId } = await requireActiveExam()
  const batch = await getBatch(batchId, examId)
  return { title: batch ? `Checkout — ${batch.name}` : "Checkout" }
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ batchId: string }>
}) {
  const { batchId } = await params
  const { user, examId } = await requireActiveExam()
  const batch = await getBatch(batchId, examId)
  if (!batch) notFound()
  // Nothing to buy: free course, or already owned.
  if (!isPaid(batch)) redirect(`/batches/${batch.id}`)
  if (isLive(await getEntitlement(user.id, batch.id))) redirect(`/batches/${batch.id}`)

  const access =
    batch.accessDays != null ? `${batch.accessDays} days of access` : "Lifetime access"

  const price = batch.priceInr!
  const onOffer = offerActive()
  const total = onOffer ? discountedInr(price) : price

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: batch.name, href: `/batches/${batch.id}` },
          { label: "Checkout" },
        ]}
      />

      <OfferBanner />

      <Reveal onMount>
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="border-b p-6">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Course
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight">{batch.name}</h1>
            {batch.cycle && (
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {batch.cycle}
              </p>
            )}
          </div>

          <ul className="space-y-3 border-b p-6 text-sm">
            <li className="flex items-center gap-3">
              <Check className="size-4 flex-none text-primary" aria-hidden />
              All recorded classes for this course
            </li>
            <li className="flex items-center gap-3">
              <Check className="size-4 flex-none text-primary" aria-hidden />
              {access}
            </li>
            <li className="flex items-center gap-3">
              <Check className="size-4 flex-none text-primary" aria-hidden />
              PDFs, gallery and practice tests
            </li>
          </ul>

          <div className="flex items-center justify-between p-6">
            <span className="text-muted-foreground">Total</span>
            <span className="flex items-baseline gap-2.5">
              {onOffer && (
                <span className="font-display text-lg font-semibold text-muted-foreground/70 line-through">
                  {formatInr(price)}
                </span>
              )}
              <span className="font-display text-3xl font-extrabold">{formatInr(total)}</span>
            </span>
          </div>
          {onOffer && (
            <p className="border-t px-6 py-3 text-center text-xs font-medium text-primary">
              You save {formatInr(price - total)} with the early-bird offer
            </p>
          )}
        </div>
      </Reveal>

      <Reveal onMount delay={0.08}>
        <CheckoutButton
          batchId={batch.id}
          courseName={batch.name}
          studentName={user.name}
          studentEmail={user.email}
        />
      </Reveal>

      <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" aria-hidden />
        Payments are processed securely by Razorpay.
      </p>
    </div>
  )
}
