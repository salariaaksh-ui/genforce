/** Indian-format rupees, e.g. 9999 → "₹9,999". */
export function formatInr(amountInr: number): string {
  return `₹${amountInr.toLocaleString("en-IN")}`
}
