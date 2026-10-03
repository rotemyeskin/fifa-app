import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  emoji,
  action,
}: {
  title: string
  subtitle?: string
  emoji?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight">
          {emoji && <span>{emoji}</span>}
          <span className="bg-gradient-to-l from-white to-white/70 bg-clip-text text-transparent">{title}</span>
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
