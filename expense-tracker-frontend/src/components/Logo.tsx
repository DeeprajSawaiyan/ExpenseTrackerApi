interface LogoProps {
  /** "dark" = for light page backgrounds, "light" = for tomato/forest backgrounds */
  tone?: 'dark' | 'light'
  className?: string
}

/** Brand mark: same spending-ring tile as the favicon. */
function LogoMark({ onTomato }: { onTomato: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`h-9 w-9 shrink-0 ${onTomato ? 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.18)]' : ''}`}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill={onTomato ? '#FFFFFF' : '#F3543B'} />
      <g fill="none" strokeWidth="9" transform="rotate(-90 32 32)">
        <circle cx="32" cy="32" r="16" stroke={onTomato ? '#F3543B' : '#FFFFFF'} strokeOpacity="0.25" />
        <circle cx="32" cy="32" r="16" stroke="#FEC93C" strokeDasharray="46 100.5" />
        <circle
          cx="32"
          cy="32"
          r="16"
          stroke={onTomato ? '#F3543B' : '#FFFFFF'}
          strokeDasharray="28 100.5"
          strokeDashoffset="-49"
        />
        <circle cx="32" cy="32" r="16" stroke="#0F241A" strokeDasharray="17 100.5" strokeDashoffset="-80" />
      </g>
    </svg>
  )
}

export default function Logo({ tone = 'dark', className = '' }: LogoProps) {
  const onTomato = tone === 'light'

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark onTomato={onTomato} />
      <span
        className={`font-display text-[1.4rem] font-extrabold tracking-tight ${onTomato ? 'text-white' : 'text-ink'}`}
      >
        Exp<span className={onTomato ? 'text-mustard' : 'text-tomato'}>Track</span>
      </span>
    </span>
  )
}
