interface SuccessAlertProps {
  message: string
  onDismiss?: () => void
}

export default function SuccessAlert({ message, onDismiss }: SuccessAlertProps) {
  return (
    <div
      className="mb-5 flex animate-fade-up items-start justify-between gap-3 rounded-2xl border-2 border-leaf/25 bg-leaf-soft px-4 py-3 text-sm font-medium text-leaf-text"
      role="status"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="-m-1 shrink-0 rounded-full p-1 leading-none hover:bg-leaf/10"
          aria-label="Dismiss success message"
        >
          ✕
        </button>
      )}
    </div>
  )
}
