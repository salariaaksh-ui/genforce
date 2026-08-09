import Link from "next/link"

type Crumb = { label: string; href?: string }

/** Up-path for deeper (app) pages. Last item has no href and is aria-current. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="font-mono text-xs uppercase tracking-widest text-muted-foreground"
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            {it.href ? (
              <Link href={it.href} className="underline-offset-4 hover:text-foreground hover:underline">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {it.label}
              </span>
            )}
            {i < items.length - 1 && (
              <span aria-hidden className="text-foreground/30">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
