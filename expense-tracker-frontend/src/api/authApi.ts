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

export interface MessageResponse {
  message: string
}

export interface ForgotPasswordResponse extends MessageResponse {
  /** False when the server has no SMTP configured (reset links only go to the server log) */
  emailDeliveryEnabled?: boolean
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post<ForgotPasswordResponse>('/forgot-password', { email })
  return response.data
}

export async function resetPassword(token: string, newPassword: string): Promise<MessageResponse> {
  const response = await apiClient.post<MessageResponse>('/reset-password', { token, newPassword })
  return response.data
}
