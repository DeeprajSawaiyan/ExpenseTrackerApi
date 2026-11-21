import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface PageHeaderProps {
  eyebrow?: string
  title: ReactNode
  description?: string
  backTo?: string
}

export default function PageHeader({ eyebrow, title, description, backTo }: PageHeaderProps) {
  return (
    <div className="mb-8 animate-fade-up">
      {backTo && (
        <Link
          to={backTo}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-ink-soft transition hover:text-ink"
        >
          ← Back to dashboard
        </Link>
      )}
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="headline mt-2 text-4xl sm:text-5xl">{title}</h1>
      {description && <p className="mt-3 max-w-xl text-ink-soft">{description}</p>}
    </div>
  )
}
