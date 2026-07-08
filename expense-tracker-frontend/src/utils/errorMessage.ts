import { isAxiosError } from 'axios'
import type { ApiError } from '../types'

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiError>(error)) {
    const data = error.response?.data

    if (data?.messages?.length) {
      return data.messages.join(', ')
    }

    if (data?.message) {
      return data.message
    }

    if (error.message) {
      return error.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}
