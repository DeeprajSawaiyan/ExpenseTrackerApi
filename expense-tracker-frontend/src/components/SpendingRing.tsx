import { useEffect, useState } from 'react'
import type { CategoryTotal } from '../hooks/useExpenseSummary'
import { getCategoryMeta } from '../utils/categories'
import { formatCurrencyShort } from '../utils/formatters'
import AnimatedAmount from './AnimatedAmount'

interface SpendingRingProps {
  total: number
  byCategory: CategoryTotal[]
  label?: string
  /** Category to emphasise (e.g. on hover in the legend) */
  highlight?: string | null
  /** Called when a segment is hovered/focused (null when the pointer leaves) */
  onHighlight?: (category: string | null) => void
  /** Called when a segment is clicked/activated */
  onSelect?: (category: string) => void
}

const SIZE = 220
const STROKE = 26
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 6 // px gap between segments

/** Donut ring showing how the month's spending splits across categories. */
export default function SpendingRing({
  total,
  byCategory,
  label = 'this month',
  highlight,
  onHighlight,
  onSelect,
}: SpendingRingProps) {
  // Animate segments in after mount
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setDrawn(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  const hasSegments = total > 0 && byCategory.length > 0
  const gap = byCategory.length > 1 ? GAP : 0

  // Precompute each segment's length and start offset along the circle
  const lengths = byCategory.map((entry) => (total > 0 ? (entry.total / total) * CIRCUMFERENCE : 0))
  const starts = lengths.map((_, index) => lengths.slice(0, index).reduce((sum, value) => sum + value, 0))

  // The centre shows the highlighted category's share, or the overall total
  const focused = highlight ? byCategory.find((entry) => entry.category === highlight) : undefined
  const focusedMeta = focused ? getCategoryMeta(focused.category) : undefined
  const interactive = Boolean(onSelect || onHighlight)

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[15rem] [container-type:inline-size]">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-full w-full -rotate-90 overflow-visible"
        role="img"
        aria-label={`${formatCurrencyShort(total)} ${label}`}
        onMouseLeave={() => onHighlight?.(null)}
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={STROKE}
        />
        {hasSegments &&
          byCategory.map((entry, index) => {
            const visible = Math.max(lengths[index] - gap, 1)
            const dashOffset = -starts[index]
            const meta = getCategoryMeta(entry.category)
            const dimmed = highlight && highlight !== entry.category
            const active = highlight === entry.category

            return (
              <circle
                key={entry.category}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={meta.color}
                strokeWidth={active ? STROKE + 8 : STROKE}
                strokeLinecap={byCategory.length > 1 ? 'butt' : 'round'}
                className={interactive ? 'cursor-pointer outline-none' : undefined}
                onMouseEnter={() => onHighlight?.(entry.category)}
                onClick={() => onSelect?.(entry.category)}
                strokeDasharray={`${drawn ? visible : 0} ${CIRCUMFERENCE}`}
                strokeDashoffset={dashOffset}
                style={{
                  transition: 'stroke-dasharray 0.9s cubic-bezier(.2,.8,.2,1), opacity 0.2s, stroke-width 0.2s',
                  opacity: dimmed ? 0.3 : 1,
                }}
              />
            )
          })}
      </svg>

      <div className="pointer-events-none absolute inset-[18%] grid place-items-center rounded-full bg-surface text-center shadow-lift">
        {focused && focusedMeta ? (
          <div key={focused.category} className="animate-fade-up px-2">
            <p className="text-[9cqw] leading-none" aria-hidden="true">
              {focusedMeta.emoji}
            </p>
            <p className="headline mt-1 whitespace-nowrap text-[11cqw] text-ink">
              {formatCurrencyShort(focused.total)}
            </p>
            <p className="mt-1 truncate text-[5.5cqw] font-semibold leading-tight text-ink-muted">
              {focused.category} · {Math.round((focused.total / total) * 100)}%
            </p>
          </div>
        ) : (
          <div className="px-2">
            <p className="headline whitespace-nowrap text-[12.5cqw] text-ink">
              <AnimatedAmount value={total} />
            </p>
            <p className="mt-1 text-[5.5cqw] font-semibold leading-tight text-ink-muted">{label}</p>
          </div>
        )}
      </div>
    </div>
  )
}
