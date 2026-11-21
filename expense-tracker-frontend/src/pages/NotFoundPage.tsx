import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFoundPage() {
  const { isAuthenticated } = useAuth()

  usePageTitle('Page Not Found')

  return (
    <div className="theme-light text-ink relative flex min-h-screen flex-col overflow-hidden bg-mustard px-5 py-6 sm:px-10">
      <Logo />

      <div className="flex flex-1 animate-fade-up flex-col items-center justify-center text-center">
        <p className="headline text-[clamp(7rem,28vw,14rem)] text-ink" aria-hidden="true">
          4<span className="text-tomato">0</span>4
        </p>
        <h1 className="headline mt-2 text-3xl sm:text-5xl">This page went missing.</h1>
        <p className="mt-3 max-w-md text-ink/75">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn-ink mt-8 px-6 py-3">
          {isAuthenticated ? 'Go to dashboard' : 'Go to login'} →
        </Link>
      </div>

      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full border-[36px] border-tomato/90"
        aria-hidden="true"
      />
    </div>
  )
}
