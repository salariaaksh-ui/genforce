import { requireActiveExam, listPdfs } from "@/lib/db/queries"
import { Breadcrumbs } from "@/components/app/breadcrumbs"

export const metadata = { title: "PDFs" }

export default async function PdfsPage() {
  const { examId } = await requireActiveExam()
  const files = await listPdfs(examId)

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: "PDFs" }]}
      />
      <h1 className="font-display text-3xl font-extrabold tracking-tight">Study PDFs</h1>

      {files.length === 0 ? (
        <p className="text-muted-foreground">No PDFs uploaded yet.</p>
      ) : (
        <ul className="divide-y border-y">
          {files.map((f) => (
            <li key={f.id}>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 py-4 hover:text-foreground"
              >
                <span className="font-display font-medium">{f.filename}</span>
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
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
