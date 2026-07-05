// Data assembly for the /depozit 3D warehouse experience (Phase 1 prototype).
// Read-only against Supabase via existing helpers in lib/supabase.ts.
// Best-effort: every failure degrades to an empty aisle/shelf, never a throw.

import {
  getCategoriesWithCount,
  getSubcategoriesByCategoryName,
  getProductsForShelf,
  type ShelfProduct,
} from './supabase'

export type WarehouseShelf = {
  /** Subcategory name (or category name for the single-shelf fallback). */
  label: string
  productCount: number
  products: ShelfProduct[]
}

export type WarehouseAisle = {
  categoryName: string
  categorySlug: string | null
  productCount: number
  shelves: WarehouseShelf[]
}

export type WarehouseData = {
  aisles: WarehouseAisle[]
  totalProducts: number
}

const MAX_AISLES = 6
const MAX_SHELVES_PER_AISLE = 4
const PRODUCTS_PER_SHELF = 15

export async function getWarehouseData(): Promise<WarehouseData> {
  let categories: Awaited<ReturnType<typeof getCategoriesWithCount>> = []
  try {
    categories = await getCategoriesWithCount()
  } catch (e) {
    console.error('[warehouse] getCategoriesWithCount failed:', e)
    return { aisles: [], totalProducts: 0 }
  }

  const topCategories = categories
    .filter(c => c.product_count > 0)
    .sort((a, b) => b.product_count - a.product_count)
    .slice(0, MAX_AISLES)

  const aisles = await Promise.all(
    topCategories.map(async (cat): Promise<WarehouseAisle> => {
      let shelves: WarehouseShelf[] = []
      try {
        const subs = (await getSubcategoriesByCategoryName(cat.name)).slice(
          0,
          MAX_SHELVES_PER_AISLE
        )
        if (subs.length > 0) {
          shelves = await Promise.all(
            subs.map(async (sub): Promise<WarehouseShelf> => ({
              label: sub.name,
              productCount: sub.product_count,
              products: await getProductsForShelf({
                categoryText: cat.name,
                subcategoryText: sub.name,
                limit: PRODUCTS_PER_SHELF,
              }),
            }))
          )
        } else {
          // Category with no subcategory rows — one shelf of category products.
          shelves = [
            {
              label: cat.name,
              productCount: cat.product_count,
              products: await getProductsForShelf({
                categoryText: cat.name,
                limit: PRODUCTS_PER_SHELF,
              }),
            },
          ]
        }
      } catch (e) {
        console.error(`[warehouse] shelf assembly failed for "${cat.name}":`, e)
      }
      return {
        categoryName: cat.name,
        categorySlug: cat.slug,
        productCount: cat.product_count,
        shelves: shelves.filter(s => s.products.length > 0),
      }
    })
  )

  const nonEmpty = aisles.filter(a => a.shelves.length > 0)
  return {
    aisles: nonEmpty,
    totalProducts: nonEmpty.reduce((n, a) => n + a.productCount, 0),
  }
}
