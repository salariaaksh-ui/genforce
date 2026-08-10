import type { ReactNode } from "react"

/** Consistent "nothing here yet" panel for the content pages. */
export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode
  title: string
  hint?: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card/50 px-6 py-16 text-center">
      {icon && (
        <div className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
          {icon}
        </div>
      )}
      <p className="font-semibold">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>}
    </div>
  )
}
