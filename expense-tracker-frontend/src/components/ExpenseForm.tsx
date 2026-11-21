import { useEffect, useState, type FormEvent } from 'react'
import type { Expense } from '../types'
import { CATEGORY_META, getCategoryMeta } from '../utils/categories'
import { focusFirstErrorField } from '../utils/focusFirstError'
import { formatCurrency, formatDate, formatDateForApi, normalizeDateForInput } from '../utils/formatters'
import ErrorAlert from './ErrorAlert'
import FormInput from './FormInput'

export interface ExpenseFormData {
  name: string
  description?: string
  amount: number
  category: string
  date: string
}

interface ExpenseFormProps {
  mode: 'create' | 'edit'
  initialValues?: Partial<Expense>
  onSubmit: (data: ExpenseFormData) => Promise<void>
  isSubmitting: boolean
  apiError?: string
  onCancel?: () => void
}

interface FieldErrors {
  name?: string
  amount?: string
  category?: string
  date?: string
}

const FIELD_ORDER: (keyof FieldErrors)[] = ['name', 'amount', 'category', 'date']

function getDefaultValues(initialValues?: Partial<Expense>) {
  return {
    name: initialValues?.name ?? '',
    description: initialValues?.description ?? '',
    amount: initialValues?.amount?.toString() ?? '',
    category: initialValues?.category ?? '',
    date: normalizeDateForInput(initialValues?.date),
  }
}

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatDateForApi(date)
}

export default function ExpenseForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting,
  apiError,
  onCancel,
}: ExpenseFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(formatDateForApi())
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    const defaults = getDefaultValues(initialValues)
    setName(defaults.name)
    setDescription(defaults.description)
    setAmount(defaults.amount)
    setCategory(defaults.category)
    setDate(defaults.date)
  }, [initialValues])

  function validateForm(): FieldErrors {
    const errors: FieldErrors = {}

    if (!name.trim()) {
      errors.name = 'Expense name is required'
    } else if (name.trim().length < 3) {
      errors.name = 'Expense name must be at least 3 characters'
    }

    const amountNumber = Number(amount)
    if (!amount.trim()) {
      errors.amount = 'Amount is required'
    } else if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      errors.amount = 'Amount must be a positive number'
    }

    if (!category) {
      errors.category = 'Pick a category'
    }

    if (!date) {
      errors.date = 'Date is required'
    }

    return errors
  }

  function clearFieldError(field: keyof FieldErrors) {
    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errors = validateForm()
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      focusFirstErrorField(FIELD_ORDER.filter((field) => errors[field]))
      return
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      amount: Number(amount),
      category,
      date,
    })
  }

  const previewMeta = category ? getCategoryMeta(category) : null
  const previewAmount = Number(amount)
  const quickDates = [
    { label: 'Today', value: daysAgo(0) },
    { label: 'Yesterday', value: daysAgo(1) },
  ]

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
      <form onSubmit={handleSubmit} noValidate className="card p-5 sm:p-8">
        {apiError && <ErrorAlert message={apiError} />}

        {/* Amount — the hero field */}
        <div className="mb-6">
          <label htmlFor="amount" className="label">
            Amount<span className="text-tomato"> *</span>
          </label>
          <div
            className={`flex items-center rounded-3xl border-2 bg-cream px-5 transition focus-within:border-ink ${
              fieldErrors.amount ? 'border-tomato' : 'border-ink/10'
            }`}
          >
            <span className="font-display text-3xl font-extrabold text-ink-muted sm:text-4xl" aria-hidden="true">
              ₹
            </span>
            <input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder="0"
              value={amount}
              aria-invalid={Boolean(fieldErrors.amount)}
              aria-describedby={fieldErrors.amount ? 'amount-error' : undefined}
              onChange={(e) => {
                setAmount(e.target.value)
                clearFieldError('amount')
              }}
              className="w-full bg-transparent py-4 pl-2 font-display text-4xl font-extrabold tracking-tight text-ink outline-none placeholder:text-ink/20 focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-5xl [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          {fieldErrors.amount && (
            <p id="amount-error" className="mt-1.5 text-sm font-medium text-tomato-dark" role="alert">
              {fieldErrors.amount}
            </p>
          )}
        </div>

        <FormInput
          label="What was it for?"
          name="name"
          type="text"
          placeholder="e.g. Lunch with team"
          required
          value={name}
          error={fieldErrors.name}
          onChange={(e) => {
            setName(e.target.value)
            clearFieldError('name')
          }}
        />

        {/* Category chips (radio group) */}
        <fieldset className="mb-5">
          <legend className="label">
            Category<span className="text-tomato"> *</span>
          </legend>
          <div className="flex flex-wrap gap-2" aria-describedby={fieldErrors.category ? 'category-error' : undefined}>
            {CATEGORY_META.map((option) => {
              const active = category === option.name
              return (
                <label
                  key={option.name}
                  className={`chip has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-tomato has-[:focus-visible]:ring-offset-2 ${
                    active ? 'chip-active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={option.name}
                    checked={active}
                    onChange={() => {
                      setCategory(option.name)
                      clearFieldError('category')
                    }}
                    className="sr-only"
                  />
                  <span aria-hidden="true">{option.emoji}</span>
                  {option.name}
                </label>
              )
            })}
          </div>
          {fieldErrors.category && (
            <p id="category-error" className="mt-1.5 text-sm font-medium text-tomato-dark" role="alert">
              {fieldErrors.category}
            </p>
          )}
        </fieldset>

        {/* Date with quick picks */}
        <div className="mb-5">
          <label htmlFor="date" className="label">
            Date<span className="text-tomato"> *</span>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {quickDates.map((quick) => (
              <button
                key={quick.label}
                type="button"
                onClick={() => {
                  setDate(quick.value)
                  clearFieldError('date')
                }}
                className={`chip ${date === quick.value ? 'chip-active' : ''}`}
                aria-pressed={date === quick.value}
              >
                {quick.label}
              </button>
            ))}
            <input
              id="date"
              name="date"
              type="date"
              value={date}
              aria-invalid={Boolean(fieldErrors.date)}
              onChange={(e) => {
                setDate(e.target.value)
                clearFieldError('date')
              }}
              className={`field w-auto flex-1 py-2 sm:max-w-[12rem] ${fieldErrors.date ? 'field-error' : ''}`}
            />
          </div>
          {fieldErrors.date && (
            <p className="mt-1.5 text-sm font-medium text-tomato-dark" role="alert">
              {fieldErrors.date}
            </p>
          )}
        </div>

        <FormInput
          label="Note"
          name="description"
          type="text"
          placeholder="Optional — anything you want to remember"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
          {onCancel && (
            <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-ghost sm:px-6">
              Cancel
            </button>
          )}
          <button type="submit" disabled={isSubmitting} className="btn-tomato flex-1 py-3.5 text-base">
            {isSubmitting
              ? mode === 'create'
                ? 'Saving…'
                : 'Updating…'
              : mode === 'create'
                ? 'Add expense'
                : 'Save changes'}
          </button>
        </div>
      </form>

      {/* Live preview */}
      <aside className="theme-light text-ink hidden rounded-4xl bg-mustard p-6 lg:sticky lg:top-24 lg:block" aria-label="Preview">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/60">Preview</p>
        <p className="headline mt-3 text-4xl text-ink">
          {previewAmount > 0 ? formatCurrency(previewAmount) : '₹0'}
        </p>
        <div className="mt-6 flex items-center gap-3 rounded-3xl bg-surface p-4 shadow-card">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl"
            style={{ backgroundColor: previewMeta ? `${previewMeta.color}26` : '#F4EADF' }}
            aria-hidden="true"
          >
            {previewMeta?.emoji ?? '✨'}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{name.trim() || 'Your expense'}</p>
            <p className="truncate text-sm text-ink-muted">
              {category || 'No category'} · {date ? formatDate(date) : 'No date'}
            </p>
          </div>
        </div>
        <p className="mt-5 text-sm text-ink/70">This is how it will appear in your list.</p>
      </aside>
    </div>
  )
}
