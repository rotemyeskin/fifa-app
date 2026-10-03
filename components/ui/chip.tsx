import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Chip({
  active,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-all active:scale-95',
        active
          ? 'border-neon/60 bg-neon/15 text-neon shadow-neon'
          : 'border-line bg-card2 text-muted hover:text-white',
        className,
      )}
      {...props}
    />
  )
}
