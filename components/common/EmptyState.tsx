import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'

export function EmptyState({
  emoji,
  title,
  description,
  action,
}: {
  emoji: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <Card className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="animate-float text-5xl">{emoji}</span>
      <h3 className="text-lg font-bold">{title}</h3>
      {description && <p className="max-w-xs text-sm text-muted">{description}</p>}
      {action}
    </Card>
  )
}
