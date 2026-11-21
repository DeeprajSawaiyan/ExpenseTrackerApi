import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import ErrorAlert from '../components/ErrorAlert'
import FormInput from '../components/FormInput'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { focusFirstErrorField } from '../utils/focusFirstError'
import { getErrorMessage } from '../utils/errorMessage'

interface FieldErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  age?: string
}

const FIELD_ORDER: (keyof FieldErrors)[] = ['name', 'email', 'password', 'confirmPassword', 'age']

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  usePageTitle('Register')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [age, setAge] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validateForm(): FieldErrors {
    const errors: FieldErrors = {}

    if (!name.trim()) {
      errors.name = 'Name is required'
    }

    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!validateEmail(email.trim())) {
      errors.email = 'Enter a valid email'
    }

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

    const ageNumber = Number(age)
    if (!age.trim()) {
      errors.age = 'Age is required'
    } else if (!Number.isInteger(ageNumber) || ageNumber < 0 || ageNumber > 130) {
      errors.age = 'Enter a valid age'
    }

    return errors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setApiError('')

    const errors = validateForm()
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      focusFirstErrorField(FIELD_ORDER.filter((field) => errors[field]))
      return
    }

    setIsSubmitting(true)

    try {
      await register(name.trim(), email.trim(), password, Number(age))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setApiError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Let’s get started."
      subtitle="Create your free account — it takes less than a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-tomato-dark hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {apiError && <ErrorAlert message={apiError} onDismiss={() => setApiError('')} />}

        <div className="grid gap-x-4 sm:grid-cols-[1fr_7rem]">
          <FormInput
            label="Name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            required
            value={name}
            error={fieldErrors.name}
            onChange={(e) => setName(e.target.value)}
          />
          <FormInput
            label="Age"
            name="age"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="25"
            required
            value={age}
            error={fieldErrors.age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
        <FormInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          error={fieldErrors.email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 5 characters"
          required
          value={password}
          error={fieldErrors.password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordInput
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Type it again"
          required
          value={confirmPassword}
          error={fieldErrors.confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit" disabled={isSubmitting} className="btn-ink mt-2 w-full py-3.5 text-base">
          {isSubmitting ? 'Creating account…' : 'Create account →'}
        </button>
      </form>
    </AuthShell>
  )
}
