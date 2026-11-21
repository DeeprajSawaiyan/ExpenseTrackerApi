import { useState, type ReactNode } from 'react'
import Logo from './Logo'
import MoneyPlayground, { PiggyBank } from './MoneyPlayground'

interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

const SAMPLE_BUBBLES = [
  { text: 'Lunch with team', amount: '₹640', rotate: '-rotate-2', delay: '0ms' },
  { text: 'Cab to office', amount: '₹180', rotate: 'rotate-1', delay: '120ms' },
  { text: 'Electricity bill', amount: '₹1,250', rotate: '-rotate-1', delay: '240ms' },
]

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  // Total "saved" by tapping the floating money on the brand panel
  const [saved, setSaved] = useState(0)

  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative overflow-hidden bg-tomato px-6 pb-10 pt-6 text-white sm:px-10 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Logo tone="light" className="relative z-10" />

        <div className="relative z-10 mt-8 lg:mt-0">
          <h1 className="headline max-w-xl text-[2.6rem] sm:text-6xl xl:text-7xl">
            Know where every rupee goes.
          </h1>
          <p className="mt-5 max-w-md text-base text-white/85 sm:text-lg">
            Log an expense in seconds, see your spending by category, and keep your month on
            track.
          </p>

          <div className="mt-6">
            <PiggyBank saved={saved} />
          </div>

          <ul className="theme-light text-ink mt-8 hidden max-w-sm flex-col gap-3 sm:flex" aria-hidden="true">
            {SAMPLE_BUBBLES.map((bubble, index) => (
              <li
                key={bubble.text}
                style={{ animationDelay: bubble.delay }}
                className={`flex animate-fade-up cursor-default items-center justify-between rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink shadow-lift transition duration-300 hover:-translate-y-1 hover:rotate-0 hover:scale-[1.03] ${bubble.rotate} ${
                  index === 1 ? 'ml-10' : ''
                }`}
              >
                <span>“{bubble.text}”</span>
                <span className="rounded-full bg-mustard px-2.5 py-0.5 font-display font-bold">
                  {bubble.amount}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 mt-10 hidden flex-wrap gap-x-8 gap-y-3 text-sm font-semibold lg:flex">
          <span>⚡ Fast logging</span>
          <span>🎯 Category insights</span>
          <span>🔒 Private to you</span>
        </div>

        {/* Decorative ring */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[28px] border-mustard/90 opacity-90 sm:-right-16 sm:-top-16 lg:-bottom-28 lg:-right-28 lg:top-auto lg:h-96 lg:w-96 lg:border-[40px]"
          aria-hidden="true"
        />

        <MoneyPlayground onSave={(value) => setSaved((current) => current + value)} />
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md animate-fade-up">
          <h2 className="headline text-4xl sm:text-5xl">{title}</h2>
          <p className="mt-3 text-ink-soft">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 text-center text-sm text-ink-soft">{footer}</div>
        </div>
      </main>
    </div>
  )
}
