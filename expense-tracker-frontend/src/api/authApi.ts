import type { LoginRequest, LoginResponse, User, UserRegisterRequest } from '../types'
import apiClient from './client'

export async function register(data: UserRegisterRequest): Promise<User> {
  const response = await apiClient.post<User>('/register', data)
  return response.data
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/login', data)
  return response.data
}
