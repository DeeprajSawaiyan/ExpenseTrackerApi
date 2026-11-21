import { useEffect, useState } from 'react'
import type { ExpenseFilterState, FilterMode } from '../hooks/useExpenses'
import { CATEGORY_META } from '../utils/categories'

const FILTER_MODES: { value: FilterMode; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'category', label: 'Category' },
  { value: 'name', label: 'Search' },
  { value: 'date', label: 'Date range' },
]

interface ExpenseFiltersProps {
  filters: ExpenseFilterState
  onChange: (filters: ExpenseFilterState) => void
  onClear: () => void
  isLoading: boolean
}

export default function ExpenseFilters({ filters, onChange, onClear, isLoading }: ExpenseFiltersProps) {
  const [keywordInput, setKeywordInput] = useState(filters.keyword)

  useEffect(() => {
    setKeywordInput(filters.keyword)
  }, [filters.keyword])

  // Debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    if (filters.mode !== 'name') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      if (keywordInput !== filters.keyword) {
        onChange({ ...filters, keyword: keywordInput })
      }
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [keywordInput, filters, onChange])

  return (
    <section className="card p-4 sm:p-5" aria-label="Filter expenses">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0" role="tablist" aria-label="Filter type">
          {FILTER_MODES.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={filters.mode === option.value}
              onClick={() => onChange({ ...filters, mode: option.value })}
              className={`chip shrink-0 ${filters.mode === option.value ? 'chip-active' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {filters.mode !== 'all' && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-semibold text-tomato-dark underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {filters.mode === 'category' && (
        <div className="mt-4 flex animate-fade-up flex-wrap gap-2" role="radiogroup" aria-label="Category">
          {CATEGORY_META.map((category) => {
            const active = filters.category === category.name
            return (
              <button
                key={category.name}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ ...filters, category: active ? '' : category.name })}
                className={`chip ${active ? 'chip-active' : ''}`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                  aria-hidden="true"
                />
                {category.name}
              </button>
            )
          })}
        </div>
      )}

      {filters.mode === 'name' && (
        <div className="relative mt-4 max-w-md animate-fade-up">
          <label htmlFor="name-filter" className="sr-only">
            Search by name
          </label>
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
            aria-hidden="true"
          >
            ⌕
          </span>
          <input
            id="name-filter"
            type="search"
            autoFocus
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Search expenses by name…"
            className="field pl-10"
          />
          {isLoading && keywordInput && (
            <span className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-ink/10 border-t-ink" />
          )}
        </div>
      )}

      {filters.mode === 'date' && (
        <div className="mt-4 grid max-w-lg animate-fade-up grid-cols-2 gap-3">
          <div>
            <label htmlFor="start-date" className="label">
              From
            </label>
            <input
              id="start-date"
              type="date"
              value={filters.startDate}
              max={filters.endDate || undefined}
              onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="label">
              To
            </label>
            <input
              id="end-date"
              type="date"
              value={filters.endDate}
              min={filters.startDate || undefined}
              onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
              className="field"
            />
          </div>
        </div>
      )}
    </section>
  )
}
