import { useCallback, useEffect, useRef, useState } from 'react'
import * as expenseApi from '../api/expenseApi'
import type { Expense } from '../types'
import { getErrorMessage } from '../utils/errorMessage'

/** Matches the row's slide-out transition in ExpenseList (duration-300) */
const DELETE_ANIMATION_MS = 300

export type FilterMode = 'all' | 'category' | 'name' | 'date'

export interface ExpenseFilterState {
  mode: FilterMode
  category: string
  keyword: string
  startDate: string
  endDate: string
}

export const DEFAULT_FILTERS: ExpenseFilterState = {
  mode: 'all',
  category: '',
  keyword: '',
  startDate: '',
  endDate: '',
}

const PAGE_SIZE = 10
const SORT = 'date,desc'

function canFetchWithFilters(filters: ExpenseFilterState): boolean {
  switch (filters.mode) {
    case 'all':
      return true
    case 'category':
      return filters.category.trim().length > 0
    case 'name':
      return filters.keyword.trim().length > 0
    case 'date':
      return Boolean(filters.startDate && filters.endDate)
    default:
      return true
  }
}

async function fetchByFilters(
  filters: ExpenseFilterState,
  page: number,
  size: number,
): Promise<Expense[]> {
  switch (filters.mode) {
    case 'category':
      return expenseApi.getByCategory(filters.category.trim(), page, size)
    case 'name':
      return expenseApi.getByName(filters.keyword.trim(), page, size)
    case 'date':
      return expenseApi.getByDate(filters.startDate, filters.endDate, page, size)
    case 'all':
    default:
      return expenseApi.getExpenses(page, size, SORT)
  }
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filters, setFiltersState] = useState<ExpenseFilterState>(DEFAULT_FILTERS)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const hasActiveFilters = filters.mode !== 'all'

  // Incremented on every fetch so a slow, outdated response can't overwrite newer results
  const requestIdRef = useRef(0)

  const fetchExpenses = useCallback(async () => {
    const requestId = ++requestIdRef.current

    if (!canFetchWithFilters(filters)) {
      setExpenses([])
      setIsLoading(false)
      setError('')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const data = await fetchByFilters(filters, page, PAGE_SIZE)
      if (requestId === requestIdRef.current) {
        setExpenses(data)
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(getErrorMessage(err))
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false)
      }
    }
  }, [filters, page])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const setFilters = useCallback((next: ExpenseFilterState) => {
    setFiltersState(next)
    setPage(0)
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS)
    setPage(0)
  }, [])

  const deleteExpense = useCallback(
    async (id: number): Promise<boolean> => {
      setDeletingId(id)
      setError('')

      try {
        // Let the row's slide-out animation finish even when the API answers instantly
        await Promise.all([
          expenseApi.deleteExpense(id),
          new Promise((resolve) => window.setTimeout(resolve, DELETE_ANIMATION_MS)),
        ])
        await fetchExpenses()
        return true
      } catch (err) {
        setError(getErrorMessage(err))
        return false
      } finally {
        setDeletingId(null)
      }
    },
    [fetchExpenses],
  )

  const hasNextPage = expenses.length === PAGE_SIZE
  const hasPrevPage = page > 0

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage((current) => current + 1)
    }
  }, [hasNextPage])

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setPage((current) => Math.max(0, current - 1))
    }
  }, [hasPrevPage])

  return {
    expenses,
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    page,
    pageSize: PAGE_SIZE,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    isLoading,
    error,
    deletingId,
    deleteExpense,
    refresh: fetchExpenses,
    clearError: () => setError(''),
  }
}
