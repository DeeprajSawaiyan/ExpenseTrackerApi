import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getExpenseById, updateExpense } from '../api/expenseApi'
import ErrorAlert from '../components/ErrorAlert'
import ExpenseForm, { type ExpenseFormData } from '../components/ExpenseForm'
import PageHeader from '../components/PageHeader'
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
      <div className="card mx-auto flex max-w-lg animate-fade-up flex-col items-center px-6 py-14 text-center">
        <div
          className="grid h-20 w-20 place-items-center rounded-full border-[10px] border-mustard bg-surface text-2xl"
          aria-hidden="true"
        >
          🤷
        </div>
        <h1 className="headline mt-5 text-3xl">Expense not found.</h1>
        <p className="mt-2 text-ink-soft">
          It doesn’t exist, or it may already have been deleted.
        </p>
        <Link to="/dashboard" className="btn-ink mt-6">
          Back to dashboard
        </Link>
      </div>
    )
  }

  if (!expense) {
    return (
      <div>
        <PageHeader backTo="/dashboard" eyebrow="Edit expense" title="Something went wrong." />
        {apiError && <ErrorAlert message={apiError} />}
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        backTo="/dashboard"
        eyebrow="Edit expense"
        title={
          <>
            Update <span className="text-tomato">{expense.name}</span>
          </>
        }
      />
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
