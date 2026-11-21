interface ErrorAlertProps {
  message: string
  onDismiss?: () => void
}

export default function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <div
      className="mb-5 flex animate-fade-up items-start justify-between gap-3 rounded-2xl border-2 border-tomato/30 bg-tomato-soft px-4 py-3 text-sm font-medium text-tomato-dark"
      role="alert"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="-m-1 shrink-0 rounded-full p-1 leading-none hover:bg-tomato/10"
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  )
}
