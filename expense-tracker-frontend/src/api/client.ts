import axios from 'axios'
import { TOKEN_KEY } from '../types'

// `||` (not `??`) so an empty value also falls back instead of calling the frontend's own origin
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl: string = error.config?.url ?? ''
    const isAuthRequest = requestUrl === '/login' || requestUrl === '/register'

    // A 401 from /login just means wrong credentials — let the page show the error.
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem(TOKEN_KEY)

      // Respect the Vite base path (e.g. /ExpenseTrackerApi/ on GitHub Pages)
      const loginPath = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/login`
      if (window.location.pathname !== loginPath) {
        // e.g. signed out because the password was reset on another device
        window.location.href = `${loginPath}?session=expired`
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
