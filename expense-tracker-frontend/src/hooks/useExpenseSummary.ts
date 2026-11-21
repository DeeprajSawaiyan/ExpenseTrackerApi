import { useCallback, useEffect, useMemo, useState } from 'react'
import * as expenseApi from '../api/expenseApi'
import type { Expense } from '../types'
import { formatDateForApi } from '../utils/formatters'

/** Upper bound on expenses loaded for the summary (Spring caps page size at 2000). */
const SUMMARY_LIMIT = 500

export interface CategoryTotal {
  category: string
  total: number
  count: number
}

export interface ExpenseSummary {
  thisMonthTotal: number
  lastMonthTotal: number
  allTimeTotal: number
  thisMonthCount: number
  totalCount: number
  /** Categories for the current month, largest first */
  byCategory: CategoryTotal[]
  /** True when there were more expenses than SUMMARY_LIMIT */
  isTruncated: boolean
}

function monthKey(date: Date) {
  return formatDateForApi(date).slice(0, 7) // "YYYY-MM"
}

function summarize(expenses: Expense[]): ExpenseSummary {
  const now = new Date()
  const thisMonth = monthKey(now)
  const lastMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1))

  let thisMonthTotal = 0
  let lastMonthTotal = 0
  let allTimeTotal = 0
  let thisMonthCount = 0
  const categories = new Map<string, CategoryTotal>()

  for (const expense of expenses) {
    const amount = Number(expense.amount) || 0
    const key = expense.date.slice(0, 7)
    allTimeTotal += amount

    if (key === lastMonth) {
      lastMonthTotal += amount
    }

    if (key === thisMonth) {
      thisMonthTotal += amount
      thisMonthCount += 1
      const entry = categories.get(expense.category) ?? {
        category: expense.category,
        total: 0,
        count: 0,
      }
      entry.total += amount
      entry.count += 1
      categories.set(expense.category, entry)
    }
  }

  return {
    thisMonthTotal,
    lastMonthTotal,
    allTimeTotal,
    thisMonthCount,
    totalCount: expenses.length,
    byCategory: [...categories.values()].sort((a, b) => b.total - a.total),
    isTruncated: expenses.length >= SUMMARY_LIMIT,
  }
}

export function useExpenseSummary() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      const data = await expenseApi.getExpenses(0, SUMMARY_LIMIT, 'date,desc')
      setExpenses(data)
      setError('')
    } catch {
      setError('Could not load your spending summary.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const summary = useMemo(() => summarize(expenses), [expenses])

  return { summary, isLoading, error, refresh }
}
