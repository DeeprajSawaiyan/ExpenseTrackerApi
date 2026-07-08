import type { InputHTMLAttributes } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function FormInput({
  label,
  error,
  id,
  className = '',
  ...props
}: FormInputProps) {
  const inputId = id ?? props.name
  const errorId = error && inputId ? `${inputId}-error` : undefined

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {props.required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`w-full rounded-md border px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
          error ? 'border-red-500' : 'border-slate-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
