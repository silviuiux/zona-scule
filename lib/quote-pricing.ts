const MARGIN = 0.25
const DISCOUNT_QUANTITY_STEP = 10
const DISCOUNT_PER_STEP = 0.01
const MAX_DISCOUNT = 0.42

export type QuotePricing = {
  unitPrice: number
  discountPct: number
  lineTotal: number
}

/**
 * Derives the customer-facing quote price (ex-TVA) from a product's
 * acquisition/cost price (`products.price`). Margin is applied first, then
 * a volume discount for 10+ units of the same product: 1% off per
 * additional 10 units, capped at 42%. The discount schedule is internal
 * business logic and must never be disclosed to the customer — only the
 * resulting price.
 */
export function computeQuotePrice(acquisitionPrice: number, quantity: number): QuotePricing {
  const basePrice = acquisitionPrice * (1 + MARGIN)
  const discountPct = quantity >= DISCOUNT_QUANTITY_STEP
    ? Math.min(MAX_DISCOUNT, Math.floor(quantity / DISCOUNT_QUANTITY_STEP) * DISCOUNT_PER_STEP)
    : 0
  const unitPrice = Math.round(basePrice * (1 - discountPct) * 100) / 100

  return {
    unitPrice,
    discountPct,
    lineTotal: Math.round(unitPrice * quantity * 100) / 100,
  }
}
