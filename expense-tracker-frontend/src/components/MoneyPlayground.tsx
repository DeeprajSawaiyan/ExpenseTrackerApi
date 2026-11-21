import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import AnimatedAmount from './AnimatedAmount'

/**
 * Playful layer for the auth brand panel: floating money emojis that follow the pointer
 * (parallax), wiggle on hover, and pop into coins when tapped, filling a piggy-bank counter.
 * Purely decorative, so it is hidden from screen readers and skipped by keyboard focus.
 */

interface FloatingMoney {
  emoji: string
  value: number
  left: string
  top: string
  /** Font size classes */
  size: string
  /** How strongly it follows the pointer: nearer things move more */
  depth: number
  duration: string
  delay: string
  /** Responsive visibility, so small screens aren't crowded */
  visibility?: string
}

// Positioned around the edges so they never sit on top of the headline or form copy
const MONEY: FloatingMoney[] = [
  { emoji: '💰', value: 500, left: '74%', top: '7%', size: 'text-4xl sm:text-5xl', depth: 1.4, duration: '6s', delay: '0s' },
  { emoji: '💸', value: 100, left: '88%', top: '19%', size: 'text-3xl sm:text-4xl', depth: 0.8, duration: '7s', delay: '-2s' },
  { emoji: '🪙', value: 10, left: '58%', top: '4%', size: 'text-2xl sm:text-3xl', depth: 0.5, duration: '5s', delay: '-1s', visibility: 'hidden sm:block' },
  { emoji: '💵', value: 200, left: '82%', top: '50%', size: 'text-4xl', depth: 1.1, duration: '6.5s', delay: '-3s', visibility: 'hidden sm:block' },
  { emoji: '🐷', value: 50, left: '68%', top: '64%', size: 'text-3xl', depth: 0.7, duration: '8s', delay: '-4s', visibility: 'hidden lg:block' },
  { emoji: '💳', value: 1000, left: '89%', top: '73%', size: 'text-3xl', depth: 1.2, duration: '7.5s', delay: '-1.5s', visibility: 'hidden lg:block' },
  { emoji: '💎', value: 2000, left: '91%', top: '38%', size: 'text-2xl', depth: 0.4, duration: '9s', delay: '-5s', visibility: 'hidden lg:block' },
  { emoji: '🤑', value: 300, left: '76%', top: '86%', size: 'text-4xl', depth: 1.6, duration: '6s', delay: '-2.5s', visibility: 'hidden lg:block' },
]

const RESPAWN_MS = 2200
const BURST_MS = 900
const COIN_DIRECTIONS = [0, 60, 120, 180, 240, 300]

interface Burst {
  id: number
  x: number
  y: number
  value: number
}

export default function MoneyPlayground({ onSave }: { onSave: (value: number) => void }) {
  const layerRef = useRef<HTMLDivElement>(null)
  const nextBurstId = useRef(0)
  const timers = useRef<number[]>([])
  const [caught, setCaught] = useState<Set<number>>(() => new Set())
  const [bursts, setBursts] = useState<Burst[]>([])

  // Clear pending respawn/burst timers if the page unmounts mid-animation
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])

  // Parallax: track the mouse over the whole panel and write its position (-1…1) into
  // CSS variables, so the emojis shift without a React re-render on every move
  useEffect(() => {
    const layer = layerRef.current
    const panel = layer?.parentElement
    if (!layer || !panel) return

    function onMove(event: PointerEvent) {
      if (event.pointerType !== 'mouse' || !layer || !panel) return
      const rect = panel.getBoundingClientRect()
      layer.style.setProperty('--px', (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3))
      layer.style.setProperty('--py', (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3))
    }
    function onLeave() {
      layer?.style.setProperty('--px', '0')
      layer?.style.setProperty('--py', '0')
    }

    panel.addEventListener('pointermove', onMove)
    panel.addEventListener('pointerleave', onLeave)
    return () => {
      panel.removeEventListener('pointermove', onMove)
      panel.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  function catchMoney(index: number, event: ReactPointerEvent<HTMLButtonElement>) {
    if (caught.has(index) || !layerRef.current) return
    const item = MONEY[index]
    const rect = layerRef.current.getBoundingClientRect()
    const burst: Burst = {
      id: nextBurstId.current++,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      value: item.value,
    }

    setCaught((current) => new Set(current).add(index))
    setBursts((current) => [...current, burst])
    onSave(item.value)

    later(() => setBursts((current) => current.filter((b) => b.id !== burst.id)), BURST_MS)
    later(
      () =>
        setCaught((current) => {
          const next = new Set(current)
          next.delete(index)
          return next
        }),
      RESPAWN_MS,
    )
  }

  return (
      <div
        ref={layerRef}
        className="pointer-events-none absolute inset-0 z-20 select-none"
        style={{ ['--px' as string]: 0, ['--py' as string]: 0 }}
        aria-hidden="true"
      >
        {MONEY.map((item, index) => {
          const isCaught = caught.has(index)
          return (
            <button
              key={item.emoji}
              type="button"
              tabIndex={-1}
              onPointerDown={(event) => catchMoney(index, event)}
              className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-manipulation ${
                item.visibility ?? ''
              }`}
              style={{ left: item.left, top: item.top }}
              title={`Tap to save ₹${item.value}`}
            >
              {/* Parallax offset */}
              <span
                className="block transition-transform duration-500 ease-out"
                style={{
                  transform: `translate(calc(var(--px) * ${item.depth * 18}px), calc(var(--py) * ${item.depth * 18}px))`,
                }}
              >
                {/* Idle bobbing */}
                <span
                  className="block animate-float"
                  style={{ animationDuration: item.duration, animationDelay: item.delay }}
                >
                  {/* Hover wiggle, pop when caught, pop back in on respawn */}
                  <span
                    key={isCaught ? 'caught' : 'live'}
                    className={`block drop-shadow-[0_6px_10px_rgba(0,0,0,0.18)] transition duration-300 ${item.size} ${
                      isCaught
                        ? 'animate-poof'
                        : 'animate-pop hover:rotate-12 hover:scale-125 active:scale-90'
                    }`}
                  >
                    {item.emoji}
                  </span>
                </span>
              </span>
            </button>
          )
        })}

        {/* Coin bursts and "+₹" labels at the tap point */}
        {bursts.map((burst) => (
          <span key={burst.id} className="absolute" style={{ left: burst.x, top: burst.y }}>
            {COIN_DIRECTIONS.map((angle) => {
              const rad = (angle * Math.PI) / 180
              return (
                <span
                  key={angle}
                  className="absolute -translate-x-1/2 -translate-y-1/2 animate-coin text-xl"
                  style={{
                    ['--dx' as string]: `${Math.cos(rad) * 70}px`,
                    ['--dy' as string]: `${Math.sin(rad) * 70}px`,
                  }}
                >
                  🪙
                </span>
              )
            })}
            <span className="absolute -translate-x-1/2 animate-rise whitespace-nowrap rounded-full bg-white px-2.5 py-1 font-display text-sm font-extrabold text-tomato-dark shadow-lift">
              +₹{burst.value.toLocaleString('en-IN')}
            </span>
          </span>
        ))}
      </div>
  )
}

/** Piggy-bank counter that fills as money is tapped. */
export function PiggyBank({ saved }: { saved: number }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm"
      aria-hidden="true"
    >
      <span key={saved} className={`text-lg ${saved > 0 ? 'animate-pop' : 'animate-float'}`}>
        🐷
      </span>
      {saved > 0 ? (
        <span>
          <AnimatedAmount value={saved} className="font-display font-extrabold" /> saved. Keep tapping!
        </span>
      ) : (
        <span>Tap the floating money to fill your piggy bank</span>
      )}
    </div>
  )
}
