import { describe, it, expect } from "vitest"
import { parseContent, ContentError } from "./schema"

const base = { exam: "afcat", batches: [], pdfs: [], gallery: [], tests: [] }

describe("parseContent", () => {
  it("accepts a minimal file and defaults arrays", () => {
    const { data } = parseContent({ exam: "afcat" })
    expect(data.exam).toBe("afcat")
    expect(data.batches).toEqual([])
    expect(data.pdfs).toEqual([])
  })

  it("accepts a full nested batch", () => {
    const { data } = parseContent({
      ...base,
      batches: [
        {
          name: "JULIET",
          cycle: "AFCAT 1 2027",
          thumbnail: "/c/j.jpg",
          priceInr: 2540,
          subjects: [
            {
              name: "Maths",
              teacher: "AG",
              lessons: [
                { idx: 1, title: "P1", source: "vimeo", playUrl: "https://player.vimeo.com/video/1" },
              ],
            },
          ],
        },
      ],
    })
    expect(data.batches[0].subjects[0].lessons[0].idx).toBe(1)
    expect(data.batches[0].subjects[0].sort).toBe(0) // default applied
  })

  it("rejects an unknown exam slug", () => {
    expect(() => parseContent({ exam: "ssc" })).toThrow(ContentError)
  })

  it("rejects a lesson with neither playUrl nor playToken", () => {
    expect(() =>
      parseContent({
        ...base,
        batches: [{ name: "B", subjects: [{ name: "S", lessons: [{ idx: 1, title: "x", source: "zoom" }] }] }],
      })
    ).toThrow(/playUrl or playToken/)
  })

  it("rejects a duplicate lesson idx within a subject", () => {
    expect(() =>
      parseContent({
        ...base,
        batches: [
          {
            name: "B",
            subjects: [
              {
                name: "S",
                lessons: [
                  { idx: 1, title: "a", source: "zoom", playToken: "t1" },
                  { idx: 1, title: "b", source: "zoom", playToken: "t2" },
                ],
              },
            ],
          },
        ],
      })
    ).toThrow(/Duplicate lesson idx 1/)
  })

  it("rejects a bad date format", () => {
    expect(() =>
      parseContent({ ...base, tests: [{ setName: "M1", formUrl: "https://x/viewform", formDate: "15-01-2026" }] })
    ).toThrow(ContentError)
  })

  it("warns on a non-viewform test link and a pdf with no hash", () => {
    const { warnings } = parseContent({
      ...base,
      pdfs: [{ filename: "a.pdf", url: "https://x/a.pdf" }],
      tests: [{ setName: "M1", formUrl: "https://docs.google.com/forms/d/EDIT/edit" }],
    })
    expect(warnings.some((w) => w.includes("viewform"))).toBe(true)
    expect(warnings.some((w) => w.includes("fileHash"))).toBe(true)
  })
})
