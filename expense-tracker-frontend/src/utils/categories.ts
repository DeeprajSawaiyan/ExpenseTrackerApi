export interface CategoryMeta {
  name: string
  emoji: string
  /** Solid color used for rings, dots and bars */
  color: string
  /** Soft background tint for chips/badges */
  tint: string
}

export const CATEGORY_META: CategoryMeta[] = [
  { name: 'Food', emoji: '🍜', color: '#F3543B', tint: '#FDE3DD' },
  { name: 'Transport', emoji: '🚕', color: '#FEC93C', tint: '#FFF3D1' },
  { name: 'Shopping', emoji: '🛍️', color: '#217A46', tint: '#DDF0E4' },
  { name: 'Bills', emoji: '🧾', color: '#7D3413', tint: '#F3E2D9' },
  { name: 'Entertainment', emoji: '🎬', color: '#5B6BE6', tint: '#E3E6FB' },
  { name: 'Health', emoji: '💊', color: '#3CB4A0', tint: '#DDF3EF' },
  { name: 'Other', emoji: '📦', color: '#A8A5B0', tint: '#ECEBEF' },
]

export const CATEGORIES = CATEGORY_META.map((category) => category.name)

const FALLBACK = CATEGORY_META[CATEGORY_META.length - 1]

export function getCategoryMeta(name: string): CategoryMeta {
  return CATEGORY_META.find((category) => category.name === name) ?? { ...FALLBACK, name }
}
