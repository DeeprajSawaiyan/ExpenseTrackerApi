import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createExpense } from '../api/expenseApi'
import ExpenseForm, { type ExpenseFormData } from '../components/ExpenseForm'
import { useAlert } from '../context/AlertContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { getErrorMessage } from '../utils/errorMessage'

export default function AddExpensePage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useAlert()

  usePageTitle('Add Expense')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  async function handleSubmit(data: ExpenseFormData) {
    setIsSubmitting(true)
    setApiError('')

    try {
      await createExpense(data)
      showSuccess('Expense added successfully!')
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

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium text-slate-900">Add Expense</h2>
      <ExpenseForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        apiError={apiError}
        onCancel={() => navigate('/dashboard')}
      />
    </div>
  )
}
