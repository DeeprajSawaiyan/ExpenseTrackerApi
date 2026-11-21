import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { deactivateAccount, updateProfile } from '../api/userApi'
import ErrorAlert from '../components/ErrorAlert'
import FormInput from '../components/FormInput'
import PageHeader from '../components/PageHeader'
import PasswordInput from '../components/PasswordInput'
import { useAlert } from '../context/AlertContext'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import type { UserUpdateRequest } from '../types'
import { getErrorMessage } from '../utils/errorMessage'
import { formatMemberSince } from '../utils/formatters'

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth()
  const { showSuccess } = useAlert()
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

  // Close the modal with Escape
  useEffect(() => {
    if (!showDeactivateModal) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isDeactivating) setShowDeactivateModal(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showDeactivateModal, isDeactivating])

  if (!user) {
    return null
  }

  const isDirty =
    name.trim() !== user.name ||
    email.trim() !== user.email ||
    Number(age) !== user.age ||
    password.trim().length > 0

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    setApiError('')

    const payload: UserUpdateRequest = {}

    if (name.trim() !== user.name) {
      if (!name.trim()) {
        setApiError('Name cannot be empty')
        return
      }
      payload.name = name.trim()
    }

    if (email.trim() !== user.email) {
      payload.email = email.trim()
    }

    const ageNumber = Number(age)
    if (ageNumber !== user.age) {
      if (!Number.isInteger(ageNumber) || ageNumber < 0) {
        setApiError('Enter a valid age')
        return
      }
      payload.age = ageNumber
    }

    if (password.trim()) {
      if (password.length < 5) {
        setApiError('Password must be at least 5 characters')
        return
      }
      payload.password = password
    }

    if (Object.keys(payload).length === 0) {
      setApiError('No changes to save')
      return
    }

    setIsSubmitting(true)

    try {
      const updatedUser = await updateProfile(payload)
      setUser(updatedUser)
      setPassword('')
      showSuccess('Profile updated')
    } catch (err) {
      setApiError(getErrorMessage(err))
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
      setApiError(getErrorMessage(err))
      setShowDeactivateModal(false)
    } finally {
      setIsDeactivating(false)
    }
  }

  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <div>
      <PageHeader eyebrow="Your account" title="Profile" />

      <div className="grid items-start gap-6 lg:grid-cols-[20rem_1fr]">
        {/* Identity card */}
        <aside className="animate-fade-up overflow-hidden rounded-4xl bg-forest text-white">
          <div className="relative bg-leaf px-6 pb-12 pt-6">
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border-[18px] border-mustard/80"
              aria-hidden="true"
            />
          </div>
          <div className="relative -mt-10 px-6 pb-6">
            <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-forest bg-tomato font-display text-2xl font-extrabold">
              {initials || '?'}
            </div>
            <p className="headline mt-4 break-words text-3xl">{user.name}</p>
            <p className="mt-1 break-all text-sm text-white/70">{user.email}</p>

            <dl className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">Age</dt>
                <dd className="mt-1 font-display text-xl font-bold">{user.age}</dd>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">Since</dt>
                <dd className="mt-1 text-sm font-semibold">{formatMemberSince(user.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </aside>

        <div className="space-y-6">
          {/* Edit form */}
          <section className="card animate-fade-up p-5 sm:p-8" style={{ animationDelay: '60ms' }}>
            <h2 className="font-display text-2xl font-bold tracking-tight">Edit details</h2>
            <p className="mt-1 text-sm text-ink-soft">Only fields you change are saved.</p>

            <form onSubmit={handleSubmit} noValidate className="mt-6">
              {apiError && <ErrorAlert message={apiError} onDismiss={() => setApiError('')} />}

              <div className="grid gap-x-4 sm:grid-cols-[1fr_7rem]">
                <FormInput
                  label="Name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <FormInput
                  label="Age"
                  name="age"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <FormInput
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <PasswordInput
                label="New password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <button type="submit" disabled={isSubmitting || !isDirty} className="btn-ink px-6">
                  {isSubmitting ? 'Saving…' : 'Save changes'}
                </button>
                {!isDirty && <span className="text-sm text-ink-muted">No unsaved changes</span>}
              </div>
            </form>
          </section>

          {/* Danger zone */}
          <section
            className="animate-fade-up rounded-3xl border-2 border-dashed border-tomato/40 bg-tomato-soft/50 p-5 sm:p-6"
            style={{ animationDelay: '120ms' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-md">
                <h2 className="font-display text-xl font-bold tracking-tight text-tomato-dark">Danger zone</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Deactivating permanently deletes your profile and every expense. This can’t be undone.
                </p>
              </div>
              <button type="button" onClick={() => setShowDeactivateModal(true)} className="btn-danger">
                Deactivate account
              </button>
            </div>
          </section>
        </div>
      </div>

      {showDeactivateModal && (
        <div
          className="fixed inset-0 z-50 flex animate-fade-up items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => !isDeactivating && setShowDeactivateModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="deactivate-title"
            className="w-full max-w-md rounded-4xl bg-surface p-6 shadow-lift sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid h-14 w-14 place-items-center rounded-full bg-tomato-soft text-2xl" aria-hidden="true">
              ⚠️
            </div>
            <h3 id="deactivate-title" className="headline mt-4 text-3xl">
              Delete everything?
            </h3>
            <p className="mt-2 text-ink-soft">
              Your account and all expenses will be permanently deleted, and you’ll be logged out.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                autoFocus
                onClick={() => setShowDeactivateModal(false)}
                disabled={isDeactivating}
                className="btn-ghost"
              >
                Keep my account
              </button>
              <button type="button" onClick={handleDeactivate} disabled={isDeactivating} className="btn-tomato">
                {isDeactivating ? 'Deleting…' : 'Yes, delete it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
