import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile', label: 'Profile' },
]

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-ink text-surface' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
  }`
}

function initials(name?: string) {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-ink/5 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/dashboard" aria-label="ExpTrack home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle labelsClassName="hidden lg:inline" className="mr-1" />
            <Link to="/expenses/new" className="btn-ink">
              <span aria-hidden="true">＋</span> Add expense
            </Link>
            <Link
              to="/profile"
              className="grid h-10 w-10 place-items-center rounded-full bg-tomato font-display text-sm font-bold text-white transition hover:scale-105"
              title={user?.name}
              aria-label="Your profile"
            >
              {initials(user?.name)}
            </Link>
            <button type="button" onClick={handleLogout} className="btn-ghost btn-sm">
              Log out
            </button>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle showLabels={false} />
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink/10 bg-surface"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="relative block h-3 w-4" aria-hidden="true">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-4 rounded bg-ink transition ${
                    isMenuOpen ? 'top-1.5 rotate-45' : ''
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-4 rounded bg-ink transition ${
                    isMenuOpen ? 'bottom-[5px] -rotate-45' : ''
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav
            id="mobile-navigation"
            className="animate-fade-up border-t border-ink/5 px-4 pb-5 pt-3 md:hidden"
            aria-label="Mobile"
            onClick={(event) => {
              // Close the menu after following any link or button inside it
              if ((event.target as HTMLElement).closest('a, button')) setIsMenuOpen(false)
            }}
          >
            {user && (
              <p className="mb-3 px-1 text-sm text-ink-muted">
                Signed in as <span className="font-semibold text-ink">{user.name}</span>
              </p>
            )}
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClass}>
                  {item.label}
                </NavLink>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to="/expenses/new" className="btn-ink">
                ＋ Add expense
              </Link>
              <button type="button" onClick={handleLogout} className="btn-ghost">
                Log out
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
