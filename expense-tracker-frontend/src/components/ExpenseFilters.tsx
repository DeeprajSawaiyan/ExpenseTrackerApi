import { useEffect, useState } from 'react'
import type { ExpenseFilterState, FilterMode } from '../hooks/useExpenses'

const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Other',
]

const FILTER_MODES: { value: FilterMode; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'category', label: 'Category' },
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date Range' },
]

interface ExpenseFiltersProps {
  filters: ExpenseFilterState
  onChange: (filters: ExpenseFilterState) => void
  onClear: () => void
  isLoading: boolean
}

export default function ExpenseFilters({
  filters,
  onChange,
  onClear,
  isLoading,
}: ExpenseFiltersProps) {
  const [keywordInput, setKeywordInput] = useState(filters.keyword)

  useEffect(() => {
    setKeywordInput(filters.keyword)
  }, [filters.keyword])

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

  function handleModeChange(mode: FilterMode) {
    onChange({ ...filters, mode })
  }

  function getActiveFilterLabel(): string {
    switch (filters.mode) {
      case 'category':
        return filters.category ? `Category: ${filters.category}` : 'Category filter'
      case 'name':
        return filters.keyword ? `Search: "${filters.keyword}"` : 'Name search'
      case 'date':
        return filters.startDate && filters.endDate
          ? `Date: ${filters.startDate} to ${filters.endDate}`
          : 'Date range filter'
      default:
        return 'All expenses'
    }
  }

  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTER_MODES.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={isLoading}
              onClick={() => handleModeChange(option.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
                filters.mode === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {filters.mode !== 'all' && (
          <button
            type="button"
            disabled={isLoading}
            onClick={onClear}
            className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="mt-3 text-sm text-slate-500">
        Active filter: <span className="font-medium text-slate-700">{getActiveFilterLabel()}</span>
      </p>

      {filters.mode === 'category' && (
        <div className="mt-4">
          <label htmlFor="category-filter" className="mb-1 block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            id="category-filter"
            disabled={isLoading}
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {filters.mode === 'name' && (
        <div className="mt-4">
          <label htmlFor="name-filter" className="mb-1 block text-sm font-medium text-slate-700">
            Search by name
          </label>
          <input
            id="name-filter"
            type="text"
            disabled={isLoading}
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Type to search expenses..."
            className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
          />
        </div>
      )}

      {filters.mode === 'date' && (
        <div className="mt-4 flex flex-wrap gap-4">
          <div>
            <label htmlFor="start-date" className="mb-1 block text-sm font-medium text-slate-700">
              Start date
            </label>
            <input
              id="start-date"
              type="date"
              disabled={isLoading}
              value={filters.startDate}
              onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="mb-1 block text-sm font-medium text-slate-700">
              End date
            </label>
            <input
              id="end-date"
              type="date"
              disabled={isLoading}
              value={filters.endDate}
              onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
            />
          </div>
        </div>
      )}
    </div>
  )
}
