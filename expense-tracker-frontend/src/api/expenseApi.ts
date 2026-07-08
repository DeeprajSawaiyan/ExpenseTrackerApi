import type { Expense } from '../types'
import apiClient from './client'

export async function getExpenses(
  page = 0,
  size = 10,
  sort = 'date,desc',
): Promise<Expense[]> {
  const response = await apiClient.get<Expense[]>('/expenses', {
    params: { page, size, sort },
  })
  return response.data
}

export async function getExpenseById(id: number): Promise<Expense> {
  const response = await apiClient.get<Expense>(`/expenses/${id}`)
  return response.data
}

export async function createExpense(data: Expense): Promise<Expense> {
  const response = await apiClient.post<Expense>('/expenses', data)
  return response.data
}

export async function updateExpense(id: number, data: Expense): Promise<Expense> {
  const response = await apiClient.put<Expense>(`/expenses/${id}`, data)
  return response.data
}

export async function deleteExpense(id: number): Promise<void> {
  await apiClient.delete('/expenses', { params: { id } })
}

export async function getByCategory(
  category: string,
  page = 0,
  size = 10,
): Promise<Expense[]> {
  const response = await apiClient.get<Expense[]>('/expenses/category', {
    params: { category, page, size },
  })
  return response.data
}

export async function getByName(
  keyword: string,
  page = 0,
  size = 10,
): Promise<Expense[]> {
  const response = await apiClient.get<Expense[]>('/expenses/name', {
    params: { keyword, page, size },
  })
  return response.data
}

export async function getByDate(
  startDate: string,
  endDate: string,
  page = 0,
  size = 10,
): Promise<Expense[]> {
  const response = await apiClient.get<Expense[]>('/expenses/date', {
    params: { startDate, endDate, page, size },
  })
  return response.data
}
