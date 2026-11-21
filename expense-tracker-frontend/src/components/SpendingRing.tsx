import { useEffect, useState } from 'react'
import type { CategoryTotal } from '../hooks/useExpenseSummary'
import { getCategoryMeta } from '../utils/categories'
import { formatCurrencyShort } from '../utils/formatters'

interface SpendingRingProps {
  total: number
  byCategory: CategoryTotal[]
  label?: string
  /** Category to emphasise (e.g. on hover in the legend) */
  highlight?: string | null
}

const SIZE = 220
const STROKE = 26
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP = 6 // px gap between segments

/** Donut ring showing how the month's spending splits across categories. */
export default function SpendingRing({ total, byCategory, label = 'this month', highlight }: SpendingRingProps) {
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

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[15rem] [container-type:inline-size]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full -rotate-90" role="img" aria-label={`${formatCurrencyShort(total)} ${label}`}>
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

            return (
              <circle
                key={entry.category}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={meta.color}
                strokeWidth={STROKE}
                strokeLinecap={byCategory.length > 1 ? 'butt' : 'round'}
                strokeDasharray={`${drawn ? visible : 0} ${CIRCUMFERENCE}`}
                strokeDashoffset={dashOffset}
                style={{
                  transition: 'stroke-dasharray 0.9s cubic-bezier(.2,.8,.2,1), opacity 0.2s',
                  opacity: dimmed ? 0.3 : 1,
                }}
              />
            )
          })}
      </svg>

      <div className="absolute inset-[18%] grid place-items-center rounded-full bg-surface text-center shadow-lift">
        <div className="px-2">
          <p className="headline whitespace-nowrap text-[12.5cqw] text-ink">{formatCurrencyShort(total)}</p>
          <p className="mt-1 text-[5.5cqw] font-semibold leading-tight text-ink-muted">{label}</p>
        </div>
      </div>
    </div>
  )
}
