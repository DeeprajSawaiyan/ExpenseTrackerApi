import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getExpenseById, updateExpense } from '../api/expenseApi'
import ExpenseForm, { type ExpenseFormData } from '../components/ExpenseForm'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAlert } from '../context/AlertContext'
import { usePageTitle } from '../hooks/usePageTitle'
import type { Expense } from '../types'
import { getErrorMessage } from '../utils/errorMessage'

export default function EditExpensePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showSuccess, showError } = useAlert()
  const expenseId = Number(id)

  usePageTitle('Edit Expense')

  const [expense, setExpense] = useState<Expense | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchExpense() {
      if (!id || Number.isNaN(expenseId)) {
        setNotFound(true)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setNotFound(false)
      setApiError('')

      try {
        const data = await getExpenseById(expenseId)
        if (!cancelled) {
          setExpense(data)
        }
      } catch (err) {
        if (!cancelled) {
          if (isAxiosError(err) && err.response?.status === 404) {
            setNotFound(true)
          } else {
            setApiError(getErrorMessage(err))
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchExpense()

    return () => {
      cancelled = true
    }
  }, [id, expenseId])

  async function handleSubmit(data: ExpenseFormData) {
    if (!expense?.id) {
      return
    }

    setIsSubmitting(true)
    setApiError('')

    try {
      await updateExpense(expense.id, data)
      showSuccess('Expense updated successfully!')
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 800)
    } catch (err) {
      const message = getErrorMessage(err)
      setApiError(message)
      showError(message)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen={false} />
  }

  if (notFound) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Expense not found</h2>
        <p className="mt-2 text-slate-600">
          The expense you are looking for does not exist or may have been deleted.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </div>
    )
  }

  if (!expense) {
    return (
      <div>
        <h2 className="mb-4 text-lg font-medium text-slate-900">Edit Expense</h2>
        {apiError && (
          <div className="mb-4">
            <p className="text-sm text-red-600">{apiError}</p>
            <Link to="/dashboard" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium text-slate-900">Edit Expense</h2>
      <ExpenseForm
        mode="edit"
        initialValues={expense}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        apiError={apiError}
        onCancel={() => navigate('/dashboard')}
      />
    </div>
  )
}
