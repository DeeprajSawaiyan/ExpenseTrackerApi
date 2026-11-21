import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Smoothly animates a number from its previous value to `target` (ease-out).
 * Jumps straight to the value when the user prefers reduced motion.
 */
export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0))
  const fromRef = useRef(value)

  useEffect(() => {
    if (prefersReducedMotion()) {
      fromRef.current = target
      const id = window.requestAnimationFrame(() => setValue(target))
      return () => window.cancelAnimationFrame(id)
    }

    const from = fromRef.current
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = from + (target - from) * eased
      fromRef.current = next
      setValue(next)
      if (progress < 1) frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
