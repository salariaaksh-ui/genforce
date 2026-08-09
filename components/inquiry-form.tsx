"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const inquirySchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().max(30).optional().or(z.literal("")),
  message: z.string().min(10, "Please add a short message (10+ characters)."),
})

type InquiryValues = z.infer<typeof inquirySchema>

export function InquiryForm({
  listingRef,
  listingLabel,
}: {
  /** Pre-filled listing ID so the enquiry routes with context. */
  listingRef?: string
  /** Human-readable listing label shown to the enquirer. */
  listingLabel?: string
}) {
  const [status, setStatus] = React.useState<
    "idle" | "submitting" | "success" | "error"
  >("idle")

  const form = useForm<InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  })

  async function onSubmit(values: InquiryValues) {
    setStatus("submitting")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, listingRef }),
      })
      if (!res.ok) throw new Error("Request failed")
      setStatus("success")
      form.reset()
    } catch {
      // Values are preserved (form not reset) so the visitor can retry.
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4"
      >
        <CheckCircle2Icon className="mt-0.5 size-5 text-primary" aria-hidden />
        <div>
          <p className="font-medium">Thanks — your enquiry has been sent.</p>
          <p className="text-sm text-muted-foreground">
            An agent will be in touch shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {listingLabel && (
          <p className="text-sm text-muted-foreground">
            Enquiring about: <span className="text-foreground">{listingLabel}</span>
          </p>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl
                render={
                  <Input
                    className="h-11"
                    autoComplete="name"
                    placeholder="Your name"
                    {...field}
                  />
                }
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl
                  render={
                    <Input
                      type="email"
                      inputMode="email"
                      className="h-11"
                      autoComplete="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  }
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Phone <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl
                  render={
                    <Input
                      type="tel"
                      inputMode="tel"
                      className="h-11"
                      autoComplete="tel"
                      placeholder="04xx xxx xxx"
                      {...field}
                    />
                  }
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl
                render={
                  <textarea
                    rows={4}
                    placeholder="I'd like to know more about this property…"
                    className="flex w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm"
                    {...field}
                  />
                }
              />
              <FormDescription>
                We&apos;ll only use your details to respond to this enquiry.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {status === "error" && (
          <p role="alert" className="text-sm text-destructive">
            Something went wrong sending your enquiry. Please try again or call us.
          </p>
        )}

        <Button
          type="submit"
          className="h-11 w-full sm:w-auto"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending…" : "Send enquiry"}
        </Button>
      </form>
    </Form>
  )
}
