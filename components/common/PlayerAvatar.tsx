import type { Player } from '@/lib/types'
import { cn } from '@/lib/utils'

const SIZES = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-base',
  md: 'h-11 w-11 text-xl',
  lg: 'h-16 w-16 text-3xl',
  xl: 'h-24 w-24 text-5xl',
}

export function PlayerAvatar({
  player,
  size = 'md',
  glow,
  className,
}: {
  player: Pick<Player, 'emoji' | 'color' | 'name'>
  size?: keyof typeof SIZES
  glow?: boolean
  className?: string
}) {
  return (
    <span
      title={player.name}
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full border-2', SIZES[size], className)}
      style={{
        borderColor: player.color,
        background: `radial-gradient(circle at 30% 25%, ${player.color}55, ${player.color}14 70%)`,
        boxShadow: glow ? `0 0 22px -2px ${player.color}aa` : undefined,
      }}
    >
      <span className="leading-none">{player.emoji}</span>
    </span>
  )
}
