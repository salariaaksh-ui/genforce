export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "")
  return digits.length === 10 ? digits : null
}
