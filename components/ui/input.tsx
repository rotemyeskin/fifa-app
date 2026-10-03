import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-line bg-bg/60 px-3 text-base text-white placeholder:text-muted/70 transition-colors focus:border-neon/60 focus:outline-none focus:ring-2 focus:ring-neon/20',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-10 rounded-xl border border-line bg-card2 px-3 text-sm text-white focus:border-neon/60 focus:outline-none',
        className,
      )}
      {...props}
    />
  )
}
