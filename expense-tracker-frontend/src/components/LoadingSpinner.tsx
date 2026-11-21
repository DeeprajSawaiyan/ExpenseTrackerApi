interface LoadingSpinnerProps {
  fullScreen?: boolean
}

export default function LoadingSpinner({ fullScreen = true }: LoadingSpinnerProps) {
  const spinner = (
    <div
      className="h-11 w-11 animate-spin rounded-full border-[5px] border-tomato-soft border-t-tomato"
      role="status"
      aria-label="Loading"
    />
  )

  if (!fullScreen) {
    return <div className="flex justify-center py-16">{spinner}</div>
  }

  return <div className="flex min-h-screen items-center justify-center bg-cream">{spinner}</div>
}
