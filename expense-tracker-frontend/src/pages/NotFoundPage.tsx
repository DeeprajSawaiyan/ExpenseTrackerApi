import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFoundPage() {
  const { isAuthenticated } = useAuth()

  usePageTitle('Page Not Found')

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <p className="text-5xl font-bold text-slate-300">404</p>
        <h1 className="mt-4 text-xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-600">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to={isAuthenticated ? '/dashboard' : '/login'}
          className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
        </Link>
      </div>
    </div>
  )
}
