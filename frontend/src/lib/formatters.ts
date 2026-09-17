const currencyFormatter = new Intl.NumberFormat('en-MY', {
  style: 'currency',
  currency: 'MYR',
  maximumFractionDigits: 2
})

const numberFormatter = new Intl.NumberFormat('en-MY', {
  maximumFractionDigits: 1
})

/**
 * Formats a value as Malaysian Ringgit (`RM 1,234.56`). Returns `'N/A'` for `null`.
 *
 * @param value - Amount in MYR, or `null` for unavailable data
 * @returns MYR string or `'N/A'`
 */
export function formatCurrency(value: number | null) {
  return value === null ? 'N/A' : currencyFormatter.format(value)
}

/**
 * Formats a number with a thousands separator and an optional unit suffix.
 *
 * @param value - Number to format, or `null` for unavailable data
 * @param unit - Optional unit appended after a single space (e.g. `'kWh'`)
 * @returns Formatted number, or `'N/A'` when `value` is null
 */
export function formatNumber(value: number | null, unit = '') {
  if (value === null) return 'N/A'
  return `${numberFormatter.format(value)}${unit ? ` ${unit}` : ''}`
}

/**
 * Recharts tooltip formatter that coerces unknown payload values into MYR strings.
 * Recharts passes tooltip values as `number | string`; this guards both shapes.
 *
 * @param value - Raw value from a Recharts tooltip payload entry
 * @returns MYR-formatted string, the original string when not numeric, or `'N/A'`
 */
export function formatTooltipCurrency(value: unknown) {
  if (typeof value === 'number') {
    return formatCurrency(value)
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? formatCurrency(parsed) : value
  }

  return 'N/A'
}
