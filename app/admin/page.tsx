import Link from "next/link"
import { db } from "@/lib/db"
import { listExams } from "@/lib/db/admin"
import { CARD } from "./_styles"

const LINKS: [string, string, string][] = [
  ["Add a lesson", "/admin/lessons", "The daily one — pick a subject, paste the video link."],
  ["Batches", "/admin/batches", "Courses students buy. Name, price, thumbnail."],
  ["Subjects", "/admin/subjects", "A subject (with teacher) inside a batch."],
  ["PDFs", "/admin/pdfs", "Notes & papers for an exam."],
  ["Tests", "/admin/tests", "Google-Form practice tests."],
  ["Gallery", "/admin/gallery", "Reference images for an exam."],
]

export default async function AdminHome() {
  const exams = await listExams(db)
  const examCount = exams.length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Content admin</h1>
        <p className="mt-2 text-muted-foreground">
          Add and manage everything students see — {examCount} exams set up. Videos are added by pasting a link
          (YouTube&nbsp;unlisted, Vimeo, or Zoom); the site plays them in place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map(([label, href, hint]) => (
          <Link
            key={href}
            href={href}
            className={`${CARD} block transition hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
          >
            <p className="font-semibold">{label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
