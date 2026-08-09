export const EXAM_SLUGS = ["afcat", "nda", "cds", "capf"] as const
export type ExamSlug = (typeof EXAM_SLUGS)[number]

export const EXAM_LABEL: Record<ExamSlug, string> = {
  afcat: "AFCAT",
  nda: "NDA",
  cds: "CDS",
  capf: "CAPF",
}

export function isExamSlug(s: string): s is ExamSlug {
  return (EXAM_SLUGS as readonly string[]).includes(s)
}
