import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Read-only star display. In RTL the fill grows from the right. */
export function Stars({ value, size = 12, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-px', className)} aria-label={`${value} כוכבים`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = value >= i ? 1 : value >= i - 0.5 ? 0.5 : 0
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-line" fill="currentColor" strokeWidth={0} size={size} />
            {fill > 0 && (
              <Star
                className="absolute inset-0 text-gold"
                fill="currentColor"
                strokeWidth={0}
                size={size}
                style={{ clipPath: fill === 0.5 ? 'inset(0 0 0 50%)' : undefined }}
              />
            )}
          </span>
        )
      })}
    </span>
  )
}
