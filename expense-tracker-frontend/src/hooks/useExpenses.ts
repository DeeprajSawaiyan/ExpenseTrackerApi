import { useCallback, useEffect, useState } from 'react'
import * as expenseApi from '../api/expenseApi'
import type { Expense } from '../types'
import { getErrorMessage } from '../utils/errorMessage'

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

  const fetchExpenses = useCallback(async () => {
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
      setExpenses(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
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
    async (id: number) => {
      setDeletingId(id)
      setError('')

      try {
        await expenseApi.deleteExpense(id)
        await fetchExpenses()
      } catch (err) {
        setError(getErrorMessage(err))
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
