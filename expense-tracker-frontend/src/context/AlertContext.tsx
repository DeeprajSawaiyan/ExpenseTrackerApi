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

const TOAST_DURATION_MS = 4000

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
    }, TOAST_DURATION_MS)

    return () => window.clearTimeout(timeoutId)
  }, [alert])

  const value = useMemo(
    () => ({ showSuccess, showError, clearAlert }),
    [showSuccess, showError, clearAlert],
  )

  return (
    <AlertContext.Provider value={value}>
      {alert && (
        <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4">
          <div
            key={alert.message}
            className={`pointer-events-auto relative flex w-full max-w-md animate-slide-down items-center gap-3 overflow-hidden rounded-full py-2.5 pl-3 pr-2 text-sm font-semibold shadow-lift ${
              alert.type === 'success' ? 'bg-leaf text-white' : 'bg-night text-white dark:ring-1 dark:ring-white/15'
            }`}
            role={alert.type === 'error' ? 'alert' : 'status'}
          >
            <span
              className={`grid h-7 w-7 shrink-0 animate-pop place-items-center rounded-full text-xs ${
                alert.type === 'success' ? 'bg-white/20' : 'bg-tomato'
              }`}
              aria-hidden="true"
            >
              {alert.type === 'success' ? '✓' : '!'}
            </span>
            <span className="flex-1">{alert.message}</span>
            <button
              type="button"
              onClick={clearAlert}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full opacity-70 transition hover:bg-white/15 hover:opacity-100"
              aria-label="Dismiss alert"
            >
              ✕
            </button>
            {alert.type === 'success' && (
              // Shows how long until the toast closes by itself
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left animate-shrink-x bg-white/60"
                style={{ animationDuration: `${TOAST_DURATION_MS}ms` }}
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      )}
      {children}
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
