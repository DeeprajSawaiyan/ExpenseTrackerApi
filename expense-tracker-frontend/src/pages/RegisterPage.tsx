import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'
import { useAlert } from '../context/AlertContext'
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

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function RegisterPage() {
  const { register } = useAuth()
  const { showError } = useAlert()
  const navigate = useNavigate()

  usePageTitle('Register')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [age, setAge] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validateForm(): FieldErrors {
    const errors: FieldErrors = {}

    if (!name.trim()) {
      errors.name = 'Name is required'
    }

    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!validateEmail(email)) {
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
    } else if (Number.isNaN(ageNumber) || ageNumber < 0) {
      errors.age = 'Enter a valid age'
    }

    return errors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errors = validateForm()
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      focusFirstErrorField(['name', 'email', 'password', 'confirmPassword', 'age'])
      return
    }

    setIsSubmitting(true)

    try {
      await register(name.trim(), email.trim(), password, Number(age))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      showError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md sm:p-8">
        <h1 className="mb-2 text-center text-2xl font-semibold text-slate-900">
          Expense Tracker
        </h1>
        <p className="mb-6 text-center text-slate-600">Create your account</p>

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            label="Name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            error={fieldErrors.name}
            onChange={(e) => setName(e.target.value)}
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            error={fieldErrors.email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            error={fieldErrors.password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            error={fieldErrors.confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <FormInput
            label="Age"
            name="age"
            type="number"
            min={0}
            required
            value={age}
            error={fieldErrors.age}
            onChange={(e) => setAge(e.target.value)}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
