import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border border-line bg-card/80 p-4 backdrop-blur-sm', className)}
      {...props}
    />
  )
}

export function CardTitle({
  children,
  action,
  icon,
  className,
}: {
  children: ReactNode
  action?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-3 flex items-center justify-between gap-2', className)}>
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted">
        {icon}
        {children}
      </h2>
      {action}
    </div>
  )
}
