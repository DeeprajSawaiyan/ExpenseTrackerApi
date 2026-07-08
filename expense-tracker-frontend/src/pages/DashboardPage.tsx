import { Link } from 'react-router-dom'
import ErrorAlert from '../components/ErrorAlert'
import ExpenseFilters from '../components/ExpenseFilters'
import ExpenseList from '../components/ExpenseList'
import LoadingSpinner from '../components/LoadingSpinner'
import { useExpenses } from '../hooks/useExpenses'
import { usePageTitle } from '../hooks/usePageTitle'

export default function DashboardPage() {
  usePageTitle('Dashboard')

  const {
    expenses,
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    page,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    isLoading,
    error,
    deletingId,
    deleteExpense,
    refresh,
    clearError,
  } = useExpenses()

  const showEmptyFilterHint =
    hasActiveFilters &&
    !isLoading &&
    !error &&
    expenses.length === 0 &&
    (filters.mode === 'category'
      ? !filters.category
      : filters.mode === 'name'
        ? !filters.keyword
        : filters.mode === 'date'
          ? !filters.startDate || !filters.endDate
          : false)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-medium text-slate-900">Dashboard</h2>
        <Link
          to="/expenses/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Expense
        </Link>
      </div>

      <ExpenseFilters
        filters={filters}
        onChange={setFilters}
        onClear={clearFilters}
        isLoading={isLoading}
      />

      {isLoading ? (
        <LoadingSpinner fullScreen={false} />
      ) : (
        <>
          {error && (
            <div className="mb-4">
              <ErrorAlert message={error} onDismiss={clearError} />
              <button
                type="button"
                onClick={refresh}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                Retry
              </button>
            </div>
          )}

          {showEmptyFilterHint && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Select filter values above to search expenses.
            </div>
          )}

          {(!error || expenses.length > 0) && (
            <ExpenseList
              expenses={expenses}
              deletingId={deletingId}
              onDelete={deleteExpense}
              hasActiveFilters={hasActiveFilters}
            />
          )}

          {!error && expenses.length > 0 && (
            <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <button
                type="button"
                onClick={prevPage}
                disabled={!hasPrevPage || isLoading}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">Page {page + 1}</span>
              <button
                type="button"
                onClick={nextPage}
                disabled={!hasNextPage || isLoading}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
