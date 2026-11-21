import { useCountUp } from '../hooks/useCountUp'
import { formatCurrencyShort } from '../utils/formatters'

interface AnimatedAmountProps {
  value: number
  className?: string
}

/** A currency amount that counts up/down to its new value. */
export default function AnimatedAmount({ value, className }: AnimatedAmountProps) {
  const animated = useCountUp(value)
  // Show whole rupees while counting; the exact value (with paise) once settled
  const display = Math.abs(animated - value) < 0.005 ? value : Math.round(animated)

  return (
    <span className={`tabular-nums ${className ?? ''}`}>
      {/* Screen readers get the final value only, not every intermediate frame */}
      <span className="sr-only">{formatCurrencyShort(value)}</span>
      <span aria-hidden="true">{formatCurrencyShort(display)}</span>
    </span>
  )
}
