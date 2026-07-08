import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '../api/authApi'
import * as userApi from '../api/userApi'
import type { User } from '../types'
import { TOKEN_KEY } from '../types'

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, age: number) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { jwtToken } = await authApi.login({ email, password })
    localStorage.setItem(TOKEN_KEY, jwtToken)
    setToken(jwtToken)

    const profile = await userApi.getProfile()
    setUser(profile)
  }, [])

  const register = useCallback(
    async (name: string, email: string, password: string, age: number) => {
      await authApi.register({ name, email, password, age })
      await login(email, password)
    },
    [login],
  )

  useEffect(() => {
    let cancelled = false

    async function initializeAuth() {
      const storedToken = localStorage.getItem(TOKEN_KEY)

      if (!storedToken) {
        if (!cancelled) {
          setIsLoading(false)
        }
        return
      }

      try {
        const profile = await userApi.getProfile()
        if (!cancelled) {
          setToken(storedToken)
          setUser(profile)
        }
      } catch {
        if (!cancelled) {
          logout()
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      cancelled = true
    }
  }, [logout])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      logout,
      setUser,
    }),
    [user, token, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
