import type { InputHTMLAttributes } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export default function FormInput({
  label,
  error,
  hint,
  id,
  className = '',
  ...props
}: FormInputProps) {
  const inputId = id ?? props.name
  const errorId = error && inputId ? `${inputId}-error` : undefined
  // Stop phones from capitalising/autocorrecting email addresses
  const emailProps =
    props.type === 'email' ? { autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false } : {}

  return (
    <div className="mb-5">
      <label htmlFor={inputId} className="label">
        {label}
        {props.required && <span className="text-tomato"> *</span>}
      </label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`field ${error ? 'field-error' : ''} ${className}`}
        {...emailProps}
        {...props}
      />
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
