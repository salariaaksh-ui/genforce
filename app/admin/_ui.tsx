"use client"

import { useRouter } from "next/navigation"
import { FIELD } from "./_styles"

/** Delete submit button that asks for confirmation before the form posts. */
export function ConfirmButton({
  label = "Delete",
  message = "Delete this? This can't be undone.",
}: {
  label?: string
  message?: string
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault()
      }}
      className="inline-flex min-h-9 items-center rounded-lg border px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {label}
    </button>
  )
}

/** A <select> that navigates to `?param=value` on change — used for the
 *  exam / batch / subject pickers so pages stay server-rendered. */
export function NavSelect({
  param,
  value,
  options,
  placeholder,
}: {
  param: string
  value?: string | null
  options: { value: string; label: string }[]
  placeholder: string
}) {
  const router = useRouter()
  return (
    <select
      className={FIELD}
      defaultValue={value ?? ""}
      onChange={(e) => router.push(`?${param}=${encodeURIComponent(e.target.value)}`)}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
