import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `block rounded-md px-3 py-2 text-sm ${
    isActive
      ? 'bg-blue-50 font-medium text-blue-600'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`
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
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">Expense Tracker</h1>

            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 md:hidden"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-controls="main-navigation"
            >
              {isMenuOpen ? 'Close' : 'Menu'}
            </button>

            <div className="hidden items-center gap-4 text-sm md:flex">
              {user && (
                <span className="text-slate-600">
                  Hi, <span className="font-medium text-slate-900">{user.name}</span>
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 transition hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          </div>

          <nav
            id="main-navigation"
            className={`${isMenuOpen ? 'mt-4 block' : 'hidden'} md:mt-4 md:block`}
          >
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-1 md:flex-row md:gap-2">
                <NavLink to="/dashboard" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </NavLink>
                <NavLink to="/profile" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
                  Profile
                </NavLink>
              </div>

              <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 md:hidden">
                {user && (
                  <span className="px-3 text-sm text-slate-600">
                    Hi, <span className="font-medium text-slate-900">{user.name}</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md border border-slate-300 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
