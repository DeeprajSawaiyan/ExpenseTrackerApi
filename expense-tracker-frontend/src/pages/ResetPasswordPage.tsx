import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/authApi'
import AuthShell from '../components/AuthShell'
import ErrorAlert from '../components/ErrorAlert'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { focusFirstErrorField } from '../utils/focusFirstError'
import { getErrorMessage } from '../utils/errorMessage'

interface FieldErrors {
  password?: string
  confirmPassword?: string
}

export default function ResetPasswordPage() {
  usePageTitle('Reset Password')

  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const { isAuthenticated, logout } = useAuth()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const signInFooter = (
    <Link to="/login" className="font-semibold text-tomato-dark hover:underline">
      Back to sign in
    </Link>
  )

  if (!token) {
    return (
      <AuthShell
        title="Link not valid."
        subtitle="This reset link is missing its code. Request a new one and use the link from the email."
        footer={signInFooter}
      >
        <Link to="/forgot-password" className="btn-ink w-full py-3.5 text-base">
          Request a new link →
        </Link>
      </AuthShell>
    )
  }

  if (isDone) {
    return (
      <AuthShell
        title="Password updated."
        subtitle="Your password has been changed and you’ve been signed out on all devices."
        footer={null}
      >
        <div className="animate-fade-up rounded-3xl bg-leaf-soft p-6 text-leaf-text">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-leaf text-xl text-white" aria-hidden="true">
            ✓
          </div>
          <p className="mt-4 font-semibold">All set — your old password no longer works.</p>
          <p className="mt-1 text-sm text-leaf-text/80">
            Any device that was signed in will need to sign in again with the new password.
          </p>
        </div>
        <Link to="/login" className="btn-ink mt-6 w-full py-3.5 text-base">
          Sign in →
        </Link>
      </AuthShell>
    )
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {}
    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 5) {
      errors.password = 'Password must be at least 5 characters'
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    return errors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setApiError('')

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      focusFirstErrorField((['password', 'confirmPassword'] as const).filter((field) => errors[field]))
      return
    }

    setIsSubmitting(true)
    try {
      await resetPassword(token, password)
      // If someone was signed in on this browser, sign them out so they log in fresh
      if (isAuthenticated) {
        logout()
      }
      setIsDone(true)
    } catch (err) {
      setApiError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const tokenProblem = /invalid|expired|already been used/i.test(apiError)

  return (
    <AuthShell
      title="Choose a new password."
      subtitle="Make it something you haven’t used here before."
      footer={signInFooter}
    >
      <form onSubmit={handleSubmit} noValidate>
        {apiError && (
          <div>
            <ErrorAlert message={apiError} onDismiss={() => setApiError('')} />
            {tokenProblem && (
              <Link to="/forgot-password" className="btn-tomato mb-6 w-full">
                Request a new link
              </Link>
            )}
          </div>
        )}

        <PasswordInput
          label="New password"
          name="password"
          autoComplete="new-password"
          autoFocus
          placeholder="At least 5 characters"
          required
          value={password}
          error={fieldErrors.password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordInput
          label="Confirm new password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Type it again"
          required
          value={confirmPassword}
          error={fieldErrors.confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit" disabled={isSubmitting} className="btn-ink mt-2 w-full py-3.5 text-base">
          {isSubmitting ? 'Updating…' : 'Reset password →'}
        </button>
      </form>
    </AuthShell>
  )
}
