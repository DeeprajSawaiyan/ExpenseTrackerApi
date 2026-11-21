/** Placeholder rows shown while expenses load, shaped like the real list so nothing jumps. */
export default function ExpenseListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card divide-y divide-ink/5 overflow-hidden" role="status" aria-label="Loading expenses">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5">
          <span className="skeleton h-11 w-11 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <span className="skeleton block h-4 rounded-full" style={{ width: `${55 - (index % 3) * 12}%` }} />
            <span className="skeleton block h-3 w-1/3 rounded-full" />
          </div>
          <span className="skeleton h-5 w-16 shrink-0 rounded-full" />
        </div>
      ))}
      <span className="sr-only">Loading expenses…</span>
    </div>
  )
}
