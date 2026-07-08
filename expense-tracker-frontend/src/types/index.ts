export const TOKEN_KEY = 'expense_tracker_token'

export interface User {
  id: number
  name: string
  email: string
  age: number
  createdAt?: string
  updatedAt?: string
}

export interface UserRegisterRequest {
  name: string
  email: string
  password: string
  age: number
}

export interface UserUpdateRequest {
  name?: string
  email?: string
  password?: string
  age?: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  jwtToken: string
}

export interface Expense {
  id?: number
  name: string
  description?: string
  amount: number
  category: string
  date: string
  createdAt?: string
  updatedAt?: string
}

export interface ApiError {
  statusCode: number
  message?: string
  messages?: string[]
  timestamp?: string
}
