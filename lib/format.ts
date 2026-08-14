/** Indian-format rupees, e.g. 9999 → "₹9,999".
 *  ponytail: prices not finalized by client — showing a placeholder everywhere.
 *  Revert to `return \`₹${amountInr.toLocaleString("en-IN")}\`` once real prices land. */
export function formatInr(_amountInr: number): string {
  return "₹xxxx"
}
