import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/authApi'
import AuthShell from '../components/AuthShell'
import ErrorAlert from '../components/ErrorAlert'
import FormInput from '../components/FormInput'
import { usePageTitle } from '../hooks/usePageTitle'
import { getErrorMessage } from '../utils/errorMessage'

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function ForgotPasswordPage() {
  usePageTitle('Forgot Password')

  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [apiError, setApiError] = useState('')
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [emailDisabled, setEmailDisabled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    setApiError('')

    const trimmed = email.trim()
    if (!trimmed) {
      setFieldError('Email is required')
      return
    }
    if (!validateEmail(trimmed)) {
      setFieldError('Enter a valid email')
      return
    }
    setFieldError('')
    setIsSubmitting(true)

    try {
      const result = await forgotPassword(trimmed)
      setEmailDisabled(result.emailDeliveryEnabled === false)
      setSentTo(trimmed)
    } catch (err) {
      setApiError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const backToLogin = (
    <>
      Remembered it?{' '}
      <Link to="/login" className="font-semibold text-tomato-dark hover:underline">
        Back to sign in
      </Link>
    </>
  )

  if (sentTo) {
    return (
      <AuthShell
        title="Check your inbox."
        subtitle="If an account exists for that email, a reset link is on its way."
        footer={backToLogin}
      >
        <div className="theme-light text-ink animate-fade-up rounded-3xl bg-mustard p-6">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl" aria-hidden="true">
            ✉️
          </div>
          <p className="mt-4 text-ink">
            We sent instructions to <span className="break-all font-semibold">{sentTo}</span>. The link
            works once and expires in <span className="font-semibold">30 minutes</span>.
          </p>
          <p className="mt-3 text-sm text-ink/70">
            Can’t find it? Check your spam folder, and make sure this is the email you signed up with.
          </p>
        </div>

        {emailDisabled && (
          <div
            className="mt-4 animate-fade-up rounded-2xl border-2 border-dashed border-tomato/40 bg-tomato-soft px-4 py-3 text-sm text-ink"
            role="note"
          >
            <p className="font-semibold text-tomato-dark">Email sending isn’t set up on this server.</p>
            <p className="mt-1 text-ink-soft">
              No email will arrive. For local testing, the reset link (if the account exists) is printed
              in the backend console. To send real emails, configure SMTP — see{' '}
              <code className="rounded bg-surface px-1 py-0.5 text-xs">local-mail.properties.example</code>.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="btn-ghost flex-1"
          >
            {isSubmitting ? 'Sending…' : 'Resend link'}
          </button>
          <button type="button" onClick={() => setSentTo(null)} className="btn-ghost flex-1">
            Use a different email
          </button>
        </div>
        {apiError && (
          <div className="mt-4">
            <ErrorAlert message={apiError} onDismiss={() => setApiError('')} />
          </div>
        )}
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="No worries. Enter your email and we’ll send you a link to reset it."
      footer={backToLogin}
    >
      <form onSubmit={handleSubmit} noValidate>
        {apiError && <ErrorAlert message={apiError} onDismiss={() => setApiError('')} />}

        <FormInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@example.com"
          required
          value={email}
          error={fieldError}
          onChange={(e) => {
            setEmail(e.target.value)
            setFieldError('')
          }}
        />

        <button type="submit" disabled={isSubmitting} className="btn-ink mt-2 w-full py-3.5 text-base">
          {isSubmitting ? 'Sending link…' : 'Send reset link →'}
        </button>
      </form>
    </AuthShell>
  )
}
