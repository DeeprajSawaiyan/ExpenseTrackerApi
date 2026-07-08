import { useEffect, useState, type FormEvent } from 'react'
import type { Expense } from '../types'
import { focusFirstErrorField } from '../utils/focusFirstError'
import { formatDateForApi, normalizeDateForInput } from '../utils/formatters'
import ErrorAlert from './ErrorAlert'
import FormInput from './FormInput'

const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Other',
]

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

function getDefaultValues(initialValues?: Partial<Expense>) {
  return {
    name: initialValues?.name ?? '',
    description: initialValues?.description ?? '',
    amount: initialValues?.amount?.toString() ?? '',
    category: initialValues?.category ?? '',
    date: normalizeDateForInput(initialValues?.date),
  }
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
      errors.category = 'Category is required'
    }

    if (!date) {
      errors.date = 'Date is required'
    }

    return errors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errors = validateForm()
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      focusFirstErrorField(['name', 'amount', 'category', 'date'])
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

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-lg">
      {apiError && <ErrorAlert message={apiError} />}

      <FormInput
        label="Name"
        name="name"
        type="text"
        required
        value={name}
        error={fieldErrors.name}
        onChange={(e) => setName(e.target.value)}
      />

      <FormInput
        label="Description"
        name="description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <FormInput
        label="Amount"
        name="amount"
        type="number"
        min={0}
        step="0.01"
        required
        value={amount}
        error={fieldErrors.amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <div className="mb-4">
        <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
          Category<span className="text-red-500"> *</span>
        </label>
        <select
          id="category"
          name="category"
          required
          value={category}
          aria-invalid={Boolean(fieldErrors.category)}
          aria-describedby={fieldErrors.category ? 'category-error' : undefined}
          onChange={(e) => setCategory(e.target.value)}
          className={`w-full rounded-md border px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
            fieldErrors.category ? 'border-red-500' : 'border-slate-300'
          }`}
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {fieldErrors.category && (
          <p id="category-error" className="mt-1 text-sm text-red-600" role="alert">
            {fieldErrors.category}
          </p>
        )}
      </div>

      <FormInput
        label="Date"
        name="date"
        type="date"
        required
        value={date}
        error={fieldErrors.date}
        onChange={(e) => setDate(e.target.value)}
      />

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? mode === 'create'
              ? 'Saving...'
              : 'Updating...'
            : mode === 'create'
              ? 'Add Expense'
              : 'Update Expense'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
