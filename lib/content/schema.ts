import { z } from "zod"
import { EXAM_SLUGS } from "@/lib/exams"

const urlStr = z.string().regex(/^https?:\/\//i, "must be an http(s) URL")
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD")

const lesson = z
  .object({
    idx: z.number().int().positive(),
    title: z.string().min(1),
    source: z.enum(["zoom", "vimeo"]),
    playUrl: urlStr.optional(),
    playToken: z.string().min(1).optional(),
    durationSec: z.number().int().positive().optional(),
    recordedOn: dateStr.optional(),
    sizeBytes: z.number().int().positive().optional(),
  })
  .refine((l) => Boolean(l.playUrl || l.playToken), {
    message: "lesson needs playUrl or playToken",
  })

const subject = z.object({
  name: z.string().min(1),
  teacher: z.string().optional(),
  coverImage: z.string().optional(),
  sort: z.number().int().default(0),
  lessons: z.array(lesson).default([]),
})

const batch = z.object({
  name: z.string().min(1),
  cycle: z.string().optional(),
  sort: z.number().int().default(0),
  thumbnail: z.string().optional(),
  priceInr: z.number().int().nonnegative().optional(),
  accessDays: z.number().int().positive().optional(), // omit = lifetime access
  description: z.string().optional(),
  subjects: z.array(subject).default([]),
})

const pdf = z.object({
  filename: z.string().min(1),
  url: urlStr,
  fileHash: z.string().optional(),
})
const galleryItem = z.object({ url: urlStr })
const testForm = z.object({
  setName: z.string().min(1),
  timeLimitMin: z.number().int().positive().optional(),
  formUrl: urlStr,
  formDate: dateStr.optional(),
})

export const contentSchema = z.object({
  exam: z.enum(EXAM_SLUGS),
  batches: z.array(batch).default([]),
  pdfs: z.array(pdf).default([]),
  gallery: z.array(galleryItem).default([]),
  tests: z.array(testForm).default([]),
})

export type Content = z.infer<typeof contentSchema>

export class ContentError extends Error {}

/** Validate raw JSON into typed content. Throws ContentError listing every hard
 *  error at once; returns soft warnings alongside the data. */
export function parseContent(raw: unknown): { data: Content; warnings: string[] } {
  const res = contentSchema.safeParse(raw)
  if (!res.success) {
    const msg = res.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n")
    throw new ContentError(`Invalid content file:\n${msg}`)
  }
  const data = res.data

  // Cross-field hard checks zod can't express cleanly.
  const batchNames = new Set<string>()
  for (const b of data.batches) {
    if (batchNames.has(b.name)) throw new ContentError(`Duplicate batch "${b.name}"`)
    batchNames.add(b.name)
    const subjNames = new Set<string>()
    for (const s of b.subjects) {
      if (subjNames.has(s.name))
        throw new ContentError(`Duplicate subject "${s.name}" in batch "${b.name}"`)
      subjNames.add(s.name)
      const idxs = new Set<number>()
      for (const l of s.lessons) {
        if (idxs.has(l.idx))
          throw new ContentError(
            `Duplicate lesson idx ${l.idx} in subject "${s.name}" (batch "${b.name}")`
          )
        idxs.add(l.idx)
      }
    }
  }

  const warnings: string[] = []
  for (const t of data.tests)
    if (!t.formUrl.includes("/viewform"))
      warnings.push(`test "${t.setName}": formUrl is not a /viewform link`)
  for (const p of data.pdfs)
    if (!p.fileHash) warnings.push(`pdf "${p.filename}": no fileHash, deriving from URL`)

  return { data, warnings }
}
