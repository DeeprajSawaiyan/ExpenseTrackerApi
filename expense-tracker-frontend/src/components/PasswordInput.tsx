import { useState, type InputHTMLAttributes, type ReactNode } from 'react'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  hint?: string
  /** Optional element shown at the right of the label row (e.g. a "Forgot password?" link) */
  labelAction?: ReactNode
}

/** Password field with a show/hide toggle. */
export default function PasswordInput({ label, error, hint, labelAction, id, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const inputId = id ?? props.name
  const errorId = error && inputId ? `${inputId}-error` : undefined

  return (
    <div className="mb-5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="label">
          {label}
          {props.required && <span className="text-tomato"> *</span>}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={`field pr-20 ${error ? 'field-error' : ''}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-ink/5 hover:text-ink"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-tomato-dark" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-sm text-ink-muted">{hint}</p>
      )}
    </div>
  )
}
