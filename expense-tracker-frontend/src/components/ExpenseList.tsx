import { Link } from 'react-router-dom'
import type { Expense } from '../types'
import { formatCurrency, formatDate } from '../utils/formatters'

interface ExpenseListProps {
  expenses: Expense[]
  deletingId: number | null
  onDelete: (id: number) => void
  hasActiveFilters?: boolean
}

export default function ExpenseList({
  expenses,
  deletingId,
  onDelete,
  hasActiveFilters = false,
}: ExpenseListProps) {
  function handleDelete(expense: Expense) {
    if (!expense.id) {
      return
    }

    const confirmed = window.confirm(`Delete expense "${expense.name}"?`)
    if (confirmed) {
      onDelete(expense.id)
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <h3 className="text-lg font-medium text-slate-900">
          {hasActiveFilters ? 'No matching expenses' : 'No expenses yet'}
        </h3>
        <p className="mt-2 text-slate-600">
          {hasActiveFilters
            ? 'Try changing your filters or clear them to see all expenses.'
            : 'Start tracking your spending by adding your first expense.'}
        </p>
        {!hasActiveFilters && (
          <Link
            to="/expenses/new"
            className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add your first expense
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Category</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{expense.name}</td>
                <td className="px-4 py-3 text-slate-600">{expense.category}</td>
                <td className="px-4 py-3 text-slate-900">{formatCurrency(expense.amount)}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(expense.date)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/expenses/${expense.id}/edit`}
                      className="rounded-md border border-slate-300 px-2.5 py-1 text-slate-700 hover:bg-slate-100"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(expense)}
                      disabled={deletingId === expense.id}
                      className="rounded-md border border-red-200 px-2.5 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === expense.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-slate-900">{expense.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{expense.category}</p>
              </div>
              <p className="font-medium text-slate-900">{formatCurrency(expense.amount)}</p>
            </div>
            <p className="mt-2 text-sm text-slate-500">{formatDate(expense.date)}</p>
            <div className="mt-4 flex gap-2">
              <Link
                to={`/expenses/${expense.id}/edit`}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-center text-sm text-slate-700 hover:bg-slate-100"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(expense)}
                disabled={deletingId === expense.id}
                className="flex-1 rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {deletingId === expense.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
