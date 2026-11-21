import { useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorAlert from '../components/ErrorAlert'
import ExpenseFilters from '../components/ExpenseFilters'
import ExpenseList from '../components/ExpenseList'
import LoadingSpinner from '../components/LoadingSpinner'
import SpendingRing from '../components/SpendingRing'
import { useAuth } from '../context/AuthContext'
import { useExpenseSummary, type ExpenseSummary } from '../hooks/useExpenseSummary'
import { useExpenses } from '../hooks/useExpenses'
import { usePageTitle } from '../hooks/usePageTitle'
import { getCategoryMeta } from '../utils/categories'
import { formatCurrencyShort } from '../utils/formatters'

function greeting(now: Date) {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function MonthComparison({ summary }: { summary: ExpenseSummary }) {
  const { thisMonthTotal, lastMonthTotal } = summary
  if (lastMonthTotal <= 0) {
    return null
  }

  const change = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
  const isUp = change > 0
  const rounded = Math.abs(Math.round(change))

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
      {rounded === 0 ? '＝ Same as' : `${isUp ? '▲' : '▼'} ${rounded}% ${isUp ? 'more than' : 'less than'}`} last
      month
    </span>
  )
}

export default function DashboardPage() {
  usePageTitle('Dashboard')

  const { user } = useAuth()
  // Captured once per visit so render stays pure
  const [now] = useState(() => new Date())
  const { summary, isLoading: isSummaryLoading, refresh: refreshSummary } = useExpenseSummary()
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

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

  async function handleDelete(id: number) {
    await deleteExpense(id)
    refreshSummary()
  }

  function filterByCategory(category: string) {
    setFilters({ ...filters, mode: 'category', category })
    document.getElementById('expenses')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const firstName = user?.name?.split(/\s+/)[0] ?? 'there'
  const monthName = new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(now)

  const showEmptyFilterHint =
    hasActiveFilters &&
    !isLoading &&
    !error &&
    expenses.length === 0 &&
    ((filters.mode === 'category' && !filters.category) ||
      (filters.mode === 'name' && !filters.keyword) ||
      (filters.mode === 'date' && (!filters.startDate || !filters.endDate)))

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Greeting */}
      <div className="flex animate-fade-up flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">
            {new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(
              now,
            )}
          </p>
          <h1 className="headline mt-2 text-4xl sm:text-5xl">
            {greeting(now)}, <span className="text-tomato">{firstName}.</span>
          </h1>
        </div>
        <Link to="/expenses/new" className="btn-ink md:hidden">
          ＋ Add expense
        </Link>
      </div>

      {/* Summary */}
      <section className="grid gap-4 lg:grid-cols-[1.25fr_1fr] lg:gap-5" aria-label="Spending summary">
        {/* This month */}
        <div className="relative flex animate-fade-up flex-col justify-between overflow-hidden rounded-4xl bg-tomato p-6 text-white sm:p-8">
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/80">
              {monthName} so far
            </p>
            {isSummaryLoading ? (
              <div className="mt-4 h-24 w-3/4 animate-pulse rounded-2xl bg-white/15" />
            ) : (
              <>
                <p className="headline mt-3 text-[clamp(2.75rem,8vw,4.75rem)]">
                  {formatCurrencyShort(summary.thisMonthTotal)}
                </p>
                <p className="mt-3 text-lg text-white/90">
                  across{' '}
                  <span className="font-semibold">
                    {summary.thisMonthCount} {summary.thisMonthCount === 1 ? 'expense' : 'expenses'}
                  </span>
                </p>
                <div className="mt-4">
                  <MonthComparison summary={summary} />
                </div>
              </>
            )}
          </div>

          <div className="theme-light text-ink relative z-10 mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-mustard p-4 text-ink">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/70">Last month</p>
              <p className="mt-1 font-display text-xl font-extrabold tracking-tight sm:text-2xl">
                {isSummaryLoading ? '—' : formatCurrencyShort(summary.lastMonthTotal)}
              </p>
            </div>
            <div className="rounded-3xl bg-white p-4 text-ink">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/60">
                All time{summary.isTruncated ? '*' : ''}
              </p>
              <p className="mt-1 font-display text-xl font-extrabold tracking-tight sm:text-2xl">
                {isSummaryLoading ? '—' : formatCurrencyShort(summary.allTimeTotal)}
              </p>
            </div>
          </div>

          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[32px] border-white/10"
            aria-hidden="true"
          />
        </div>

        {/* Category ring */}
        <div className="animate-fade-up rounded-4xl bg-forest p-6 text-white sm:p-8" style={{ animationDelay: '80ms' }}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-bold tracking-tight">Where it went</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">{monthName}</span>
          </div>

          {isSummaryLoading ? (
            <div className="mx-auto mt-6 aspect-square w-full max-w-[15rem] animate-pulse rounded-full border-[26px] border-white/10" />
          ) : summary.byCategory.length === 0 ? (
            <div className="mt-6 text-center">
              <SpendingRing total={0} byCategory={[]} />
              <p className="mt-5 text-sm text-white/70">Nothing logged this month yet.</p>
            </div>
          ) : (
            <div className="mt-6 grid items-center gap-6 sm:grid-cols-[minmax(0,13rem)_1fr] lg:grid-cols-1 xl:grid-cols-[minmax(0,12rem)_1fr]">
              <SpendingRing total={summary.thisMonthTotal} byCategory={summary.byCategory} highlight={hoveredCategory} />

              <ul className="space-y-1" onMouseLeave={() => setHoveredCategory(null)}>
                {summary.byCategory.map((entry) => {
                  const meta = getCategoryMeta(entry.category)
                  const percent = Math.round((entry.total / summary.thisMonthTotal) * 100)
                  return (
                    <li key={entry.category}>
                      <button
                        type="button"
                        onClick={() => filterByCategory(entry.category)}
                        onMouseEnter={() => setHoveredCategory(entry.category)}
                        onFocus={() => setHoveredCategory(entry.category)}
                        onBlur={() => setHoveredCategory(null)}
                        className="w-full rounded-2xl px-3 py-2 text-left transition hover:bg-white/10"
                        title={`Show ${entry.category} expenses`}
                      >
                        <span className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex items-center gap-2 font-semibold">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                            {entry.category}
                          </span>
                          <span className="whitespace-nowrap text-white/70">
                            {formatCurrencyShort(entry.total)} · {percent}%
                          </span>
                        </span>
                        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-white/10">
                          <span
                            className="block h-full rounded-full transition-all duration-700"
                            style={{ width: `${percent}%`, backgroundColor: meta.color }}
                          />
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Expense list */}
      <section id="expenses" className="scroll-mt-24 space-y-4" aria-labelledby="expenses-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="expenses-heading" className="headline text-3xl sm:text-4xl">
            Your expenses
          </h2>
          {summary.isTruncated && (
            <p className="text-xs text-ink-muted">*Totals use your latest 500 expenses</p>
          )}
        </div>

        <ExpenseFilters filters={filters} onChange={setFilters} onClear={clearFilters} isLoading={isLoading} />

        {error && (
          <div>
            <ErrorAlert message={error} onDismiss={clearError} />
            <button type="button" onClick={refresh} className="btn-ghost btn-sm">
              Try again
            </button>
          </div>
        )}

        {showEmptyFilterHint && (
          <div className="rounded-2xl border-2 border-mustard bg-mustard-soft px-4 py-3 text-sm font-medium text-ink">
            Pick a filter value above to search your expenses.
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner fullScreen={false} />
        ) : (
          (!error || expenses.length > 0) &&
          !showEmptyFilterHint && (
            <ExpenseList
              expenses={expenses}
              deletingId={deletingId}
              onDelete={handleDelete}
              hasActiveFilters={hasActiveFilters}
            />
          )
        )}

        {!isLoading && !error && (hasPrevPage || hasNextPage) && (
          <nav className="flex items-center justify-between gap-3" aria-label="Pagination">
            <button type="button" onClick={prevPage} disabled={!hasPrevPage} className="btn-ghost">
              ← Previous
            </button>
            <span className="rounded-full bg-surface px-4 py-2 text-sm font-semibold shadow-card">Page {page + 1}</span>
            <button type="button" onClick={nextPage} disabled={!hasNextPage} className="btn-ghost">
              Next →
            </button>
          </nav>
        )}
      </section>
    </div>
  )
}
