import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 select-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon/60',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-l from-neon to-volt text-bg shadow-neon hover:brightness-110',
        secondary: 'bg-card2 text-white border border-line hover:bg-line',
        ghost: 'text-muted hover:text-white hover:bg-card2',
        outline: 'border border-neon/40 text-neon hover:bg-neon/10',
        violet: 'bg-gradient-to-l from-violet to-fuchsia-500 text-white shadow-violet hover:brightness-110',
        destructive: 'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-base',
        lg: 'h-14 px-6 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'

export { buttonVariants }
