import { useTheme } from '../hooks/useTheme'

interface ThemeToggleProps {
  /** Show the "Light" / "Dark" words beside the switch */
  showLabels?: boolean
  /** Extra classes for the labels, e.g. "hidden lg:inline" to show them only on wide screens */
  labelsClassName?: string
  className?: string
}

const STARS = [
  { top: '22%', left: '18%', size: 4, delay: '0ms' },
  { top: '58%', left: '30%', size: 3, delay: '300ms' },
  { top: '30%', left: '42%', size: 2, delay: '600ms' },
  { top: '66%', left: '12%', size: 2, delay: '900ms' },
]

/** Light/dark slide switch: sun on a sky track ↔ moon on a starry indigo track. */
export default function ThemeToggle({ showLabels = true, labelsClassName = '', className = '' }: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const labelClass = (active: boolean) =>
    `font-display text-[0.95rem] font-bold tracking-tight transition-colors duration-300 ${labelsClassName} ${
      active ? 'text-ink' : 'text-ink-muted/60 hover:text-ink-muted'
    }`

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {showLabels && (
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={labelClass(!isDark)}
          tabIndex={-1}
          aria-hidden="true"
        >
          Light
        </button>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Dark mode"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggleTheme}
        className={`relative h-9 w-[4.25rem] shrink-0 overflow-hidden rounded-full transition-[background-color,box-shadow] duration-500 ${
          isDark
            ? 'bg-[#3D3A92] shadow-[0_0_22px_rgba(98,92,230,0.55),inset_0_2px_4px_rgba(0,0,0,0.25)]'
            : 'bg-[#7CC6F2] shadow-[0_0_18px_rgba(124,198,242,0.55),inset_0_2px_4px_rgba(0,0,0,0.12)]'
        }`}
      >
        {/* Stars (dark) */}
        {STARS.map((star) => (
          <span
            key={`${star.top}-${star.left}`}
            className={`absolute rounded-full bg-white transition-all duration-500 ${
              isDark ? 'translate-y-0 animate-pulse opacity-90' : 'translate-y-2 opacity-0'
            }`}
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
            }}
            aria-hidden="true"
          />
        ))}

        {/* Clouds (light) */}
        <span
          className={`absolute bottom-1.5 right-2 transition-all duration-500 ${
            isDark ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
          }`}
          aria-hidden="true"
        >
          <span className="absolute bottom-0 right-0 h-2.5 w-6 rounded-full bg-white" />
          <span className="absolute bottom-1 right-1.5 h-3.5 w-3.5 rounded-full bg-white" />
          <span className="absolute bottom-0.5 right-4 h-2.5 w-2.5 rounded-full bg-white/90" />
        </span>

        {/* Knob: sun ↔ moon */}
        <span
          className={`absolute left-1 top-1 h-7 w-7 overflow-hidden rounded-full transition-all duration-500 ease-[cubic-bezier(.68,-0.35,.32,1.35)] ${
            isDark
              ? 'translate-x-[2.25rem] bg-[#F8EED6] shadow-[0_0_10px_rgba(248,238,214,0.6)]'
              : 'translate-x-0 bg-mustard shadow-[0_0_10px_rgba(254,201,60,0.9)]'
          }`}
          aria-hidden="true"
        >
          {/* Shadow disc that carves the crescent */}
          <span
            className={`absolute h-full w-full rounded-full bg-[#3D3A92] transition-all duration-500 ${
              isDark ? '-left-2.5 -top-1 opacity-100' : '-left-8 -top-1 opacity-0'
            }`}
          />
        </span>
      </button>

      {showLabels && (
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={labelClass(isDark)}
          tabIndex={-1}
          aria-hidden="true"
        >
          Dark
        </button>
      )}
    </div>
  )
}
