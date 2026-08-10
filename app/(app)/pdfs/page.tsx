import { FileText } from "lucide-react"
import { requireActiveExam, listPdfs } from "@/lib/db/queries"
import { Breadcrumbs } from "@/components/app/breadcrumbs"
import { Reveal } from "@/components/motion/reveal"
import { EmptyState } from "@/components/app/empty-state"

export const metadata = { title: "PDFs" }

export default async function PdfsPage() {
  const { examId } = await requireActiveExam()
  const files = await listPdfs(examId)

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: "PDFs" }]}
      />
      <Reveal onMount>
        <h1 className="text-3xl font-extrabold tracking-tight">Study PDFs</h1>
      </Reveal>

      {files.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-5" />}
          title="No PDFs uploaded yet"
          hint="Notes and papers for your exam will show up here."
        />
      ) : (
        <ul className="divide-y overflow-hidden rounded-2xl border">
          {files.map((f) => (
            <li key={f.id}>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 bg-card px-5 py-4 transition-colors hover:bg-accent"
              >
                <span className="font-medium">{f.filename}</span>
                <span className="font-mono text-xs uppercase tracking-widest text-primary">
                  Download ↓
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
