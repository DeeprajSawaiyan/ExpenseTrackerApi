import type { User, UserUpdateRequest } from '../types'
import apiClient from './client'

export async function getProfile(): Promise<User> {
  const response = await apiClient.get<User>('/profile')
  return response.data
}

export async function updateProfile(data: UserUpdateRequest): Promise<User> {
  const response = await apiClient.put<User>('/profile', data)
  return response.data
}

export async function deactivateAccount(): Promise<void> {
  await apiClient.delete('/deactivate')
}
