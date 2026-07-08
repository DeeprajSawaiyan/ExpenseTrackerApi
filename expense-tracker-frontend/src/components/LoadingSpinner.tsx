interface LoadingSpinnerProps {
  fullScreen?: boolean
}

export default function LoadingSpinner({ fullScreen = true }: LoadingSpinnerProps) {
  const spinner = (
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
  )

  if (!fullScreen) {
    return <div className="flex justify-center py-12">{spinner}</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      {spinner}
    </div>
  )
}
