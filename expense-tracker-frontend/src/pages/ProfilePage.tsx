import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { deactivateAccount, updateProfile } from '../api/userApi'
import ErrorAlert from '../components/ErrorAlert'
import FormInput from '../components/FormInput'
import { useAlert } from '../context/AlertContext'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import type { UserUpdateRequest } from '../types'
import { getErrorMessage } from '../utils/errorMessage'
import { formatMemberSince } from '../utils/formatters'

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth()
  const { showSuccess, showError } = useAlert()
  const navigate = useNavigate()

  usePageTitle('Profile')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [password, setPassword] = useState('')
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setAge(String(user.age))
    }
  }, [user])

  if (!user) {
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setApiError('')

    const payload: UserUpdateRequest = {}

    if (name.trim() !== user.name) {
      payload.name = name.trim()
    }

    if (email.trim() !== user.email) {
      payload.email = email.trim()
    }

    const ageNumber = Number(age)
    if (ageNumber !== user.age) {
      payload.age = ageNumber
    }

    if (password.trim()) {
      if (password.length < 5) {
        const message = 'Password must be at least 5 characters'
        setApiError(message)
        showError(message)
        return
      }
      payload.password = password
    }

    if (Object.keys(payload).length === 0) {
      const message = 'No changes to save'
      setApiError(message)
      showError(message)
      return
    }

    setIsSubmitting(true)

    try {
      const updatedUser = await updateProfile(payload)
      setUser(updatedUser)
      setPassword('')
      showSuccess('Profile updated successfully')
    } catch (err) {
      const message = getErrorMessage(err)
      setApiError(message)
      showError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeactivate() {
    setIsDeactivating(true)
    setApiError('')

    try {
      await deactivateAccount()
      logout()
      navigate('/login', { replace: true })
    } catch (err) {
      const message = getErrorMessage(err)
      setApiError(message)
      showError(message)
      setShowDeactivateModal(false)
    } finally {
      setIsDeactivating(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-lg font-medium text-slate-900">Profile</h2>

      <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-medium text-slate-900">Account information</h3>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium text-slate-900">{user.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Age</dt>
            <dd className="font-medium text-slate-900">{user.age}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Member since</dt>
            <dd className="font-medium text-slate-900">{formatMemberSince(user.createdAt)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-medium text-slate-900">Edit profile</h3>
        <p className="mt-1 text-sm text-slate-600">Update your account details below.</p>

        {apiError && (
          <div className="mt-4">
            <ErrorAlert message={apiError} onDismiss={() => setApiError('')} />
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6">
          <FormInput
            label="Name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormInput
            label="Age"
            name="age"
            type="number"
            min={0}
            required
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <FormInput
            label="New password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-medium text-red-700">Danger zone</h3>
        <p className="mt-2 text-sm text-slate-600">
          Deactivating your account will permanently delete your profile and all associated
          expenses. This action cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setShowDeactivateModal(true)}
          className="mt-4 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Deactivate Account
        </button>
      </div>

      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-medium text-slate-900">Deactivate account?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This will permanently delete your account and all expenses. You will be logged out
              immediately.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                disabled={isDeactivating}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={isDeactivating}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeactivating ? 'Deactivating...' : 'Yes, deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
