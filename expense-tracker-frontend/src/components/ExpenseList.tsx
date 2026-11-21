import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Expense } from '../types'
import { getCategoryMeta } from '../utils/categories'
import { formatCurrencyShort, formatDate } from '../utils/formatters'

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
  // Two-tap delete: first tap asks "Sure?", second tap deletes
  const [confirmingId, setConfirmingId] = useState<number | null>(null)

  function handleDelete(expense: Expense) {
    if (!expense.id) return

    if (confirmingId === expense.id) {
      setConfirmingId(null)
      onDelete(expense.id)
    } else {
      setConfirmingId(expense.id)
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="card flex flex-col items-center px-6 py-14 text-center">
        <div
          className="grid h-20 w-20 place-items-center rounded-full border-[10px] border-mustard bg-surface text-2xl"
          aria-hidden="true"
        >
          {hasActiveFilters ? '🔍' : '🧾'}
        </div>
        <h3 className="headline mt-5 text-3xl">
          {hasActiveFilters ? 'Nothing matches.' : 'Nothing logged yet.'}
        </h3>
        <p className="mt-2 max-w-sm text-ink-soft">
          {hasActiveFilters
            ? 'Try a different filter, or clear filters to see everything.'
            : 'Add your first expense and your spending ring will start to fill up.'}
        </p>
        {!hasActiveFilters && (
          <Link to="/expenses/new" className="btn-tomato mt-6">
            ＋ Add your first expense
          </Link>
        )}
      </div>
    )
  }

  return (
    <ul className="card divide-y divide-ink/5 overflow-hidden">
      {expenses.map((expense, index) => {
        const meta = getCategoryMeta(expense.category)
        const isDeleting = deletingId === expense.id
        const isConfirming = confirmingId === expense.id

        return (
          <li
            key={expense.id}
            style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
            className={`group flex animate-fade-up items-center gap-3 px-4 py-3.5 transition duration-300 hover:bg-cream sm:gap-4 sm:px-5 ${
              isDeleting ? 'pointer-events-none translate-x-8 opacity-0' : ''
            }`}
          >
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl transition duration-300 group-hover:-rotate-6 group-hover:scale-110"
              style={{ backgroundColor: `${meta.color}26` }}
              aria-hidden="true"
            >
              {meta.emoji}
            </span>

            <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-4">
              {/* Name + meta (amount sits beside the name on mobile) */}
              <div className="min-w-0 sm:flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate font-semibold text-ink">{expense.name}</p>
                  <p className="shrink-0 font-display text-base font-bold tracking-tight text-ink sm:hidden">
                    {formatCurrencyShort(expense.amount)}
                  </p>
                </div>
                <p className="mt-0.5 flex min-w-0 items-center gap-x-2 overflow-hidden whitespace-nowrap text-sm text-ink-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />
                    {expense.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDate(expense.date)}</span>
                  {expense.description && (
                    <span className="hidden min-w-0 truncate md:inline">· {expense.description}</span>
                  )}
                </p>
              </div>

              <p className="hidden shrink-0 font-display text-lg font-bold tracking-tight text-ink sm:block">
                {formatCurrencyShort(expense.amount)}
              </p>
            </div>

            <div className="flex shrink-0 gap-1.5 self-center sm:opacity-60 sm:transition sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <Link
                to={`/expenses/${expense.id}/edit`}
                className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink/10 bg-surface text-sm transition hover:border-ink sm:h-9 sm:w-9"
                aria-label={`Edit ${expense.name}`}
                title="Edit"
              >
                ✎
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(expense)}
                onBlur={() => isConfirming && setConfirmingId(null)}
                disabled={isDeleting}
                className={`h-8 rounded-full border-2 text-sm font-semibold transition sm:h-9 ${
                  isConfirming
                    ? 'animate-pop border-tomato bg-tomato px-3 text-white'
                    : 'w-8 border-ink/10 bg-surface text-ink hover:border-tomato hover:text-tomato sm:w-9'
                }`}
                aria-label={isConfirming ? `Confirm delete ${expense.name}` : `Delete ${expense.name}`}
                title="Delete"
              >
                {isDeleting ? '…' : isConfirming ? 'Sure?' : '🗑'}
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
