import { cn } from "@/lib/utils"

/** The mark: a left index rail with ascending altimeter ticks; the top tick is
 *  the lime signal — reading as climb / forward force. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-6", className)}
      aria-hidden="true"
      fill="currentColor"
    >
      <rect x="4" y="3" width="2" height="18" />
      <rect x="6.5" y="17.5" width="4.5" height="2" />
      <rect x="6.5" y="13" width="7" height="2" />
      <rect x="6.5" y="8.5" width="9.5" height="2" />
      <rect x="6.5" y="4" width="12" height="2" className="fill-signal" />
    </svg>
  )
}

/** Full lockup: mark + wordmark. Wordmark is set in the display face, lowercase,
 *  tight — matching how the brand is written. */
export function Logo({
  className,
  markClassName,
}: {
  className?: string
  markClassName?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      <span className="font-display text-lg font-extrabold lowercase tracking-tight">
        genforce
      </span>
    </span>
  )
}
