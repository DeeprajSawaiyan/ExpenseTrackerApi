interface SuccessAlertProps {
  message: string
  onDismiss?: () => void
}

export default function SuccessAlert({ message, onDismiss }: SuccessAlertProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-green-500 hover:text-green-700"
          aria-label="Dismiss success message"
        >
          ×
        </button>
      )}
    </div>
  )
}
