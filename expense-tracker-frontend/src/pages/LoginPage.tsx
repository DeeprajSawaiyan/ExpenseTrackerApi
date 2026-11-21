import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import ErrorAlert from '../components/ErrorAlert'
import FormInput from '../components/FormInput'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { getErrorMessage } from '../utils/errorMessage'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showSessionNotice, setShowSessionNotice] = useState(searchParams.get('session') === 'expired')

  usePageTitle('Login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Enter your email and password to sign in.')
      return
    }

    setIsSubmitting(true)

    try {
      await login(email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to pick up where you left off."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-tomato-dark hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {showSessionNotice && !error && (
          <div
            className="mb-5 flex animate-fade-up items-start justify-between gap-3 rounded-2xl border-2 border-mustard bg-mustard-soft px-4 py-3 text-sm font-medium text-ink"
            role="status"
          >
            <span>Your session has ended — for example, because your password was changed. Please sign in again.</span>
            <button
              type="button"
              onClick={() => setShowSessionNotice(false)}
              className="-m-1 shrink-0 rounded-full p-1 leading-none hover:bg-ink/5"
              aria-label="Dismiss notice"
            >
              ✕
            </button>
          </div>
        )}
        {error && <ErrorAlert message={error} onDismiss={() => setError('')} />}

        <FormInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
          labelAction={
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-tomato-dark underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          }
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={isSubmitting} className="btn-ink mt-2 w-full py-3.5 text-base">
          {isSubmitting ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>
    </AuthShell>
  )
}
