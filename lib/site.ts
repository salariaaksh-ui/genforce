/**
 * Central site configuration. Brand identity stays neutral ("Genforce") until
 * the design-DNA pass — do not invent a logo/palette here.
 */
export const siteConfig = {
  name: "Genforce",
  tagline: "Exam prep for AFCAT, NDA, CDS & CAPF.",
  description:
    "Genforce is an exam-prep platform for Indian defence entrance exams — recorded classes, practice tests, and study material.",
  /** Production origin; override with NEXT_PUBLIC_SITE_URL at build time. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3007",
  contact: {
    // TODO(client): real support address.
    email: "support@genforce.example",
  },
} as const
