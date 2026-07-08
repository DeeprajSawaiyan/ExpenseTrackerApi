import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type AlertType = 'success' | 'error'

interface AlertState {
  type: AlertType
  message: string
}

interface AlertContextValue {
  showSuccess: (message: string) => void
  showError: (message: string) => void
  clearAlert: () => void
}

const AlertContext = createContext<AlertContextValue | null>(null)

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertState | null>(null)

  const clearAlert = useCallback(() => {
    setAlert(null)
  }, [])

  const showSuccess = useCallback((message: string) => {
    setAlert({ type: 'success', message })
  }, [])

  const showError = useCallback((message: string) => {
    setAlert({ type: 'error', message })
  }, [])

  useEffect(() => {
    if (!alert || alert.type !== 'success') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setAlert(null)
    }, 4000)

    return () => window.clearTimeout(timeoutId)
  }, [alert])

  const value = useMemo(
    () => ({ showSuccess, showError, clearAlert }),
    [showSuccess, showError, clearAlert],
  )

  return (
    <AlertContext.Provider value={value}>
      {alert && (
        <div
          className={`fixed inset-x-0 top-0 z-50 border-b px-4 py-3 text-center text-sm font-medium shadow-md ${
            alert.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
          role="alert"
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <span className="flex-1">{alert.message}</span>
            <button
              type="button"
              onClick={clearAlert}
              className="shrink-0 text-current opacity-70 hover:opacity-100"
              aria-label="Dismiss alert"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className={alert ? 'pt-12' : undefined}>{children}</div>
    </AlertContext.Provider>
  )
}

export function useAlert(): AlertContextValue {
  const context = useContext(AlertContext)

  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider')
  }

  return context
}
