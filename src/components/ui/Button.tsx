import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import Spinner from './Spinner'

const buttonVariants = cva(
  `inline-flex items-center justify-center font-medium rounded-md
   transition-all duration-300 ease-[var(--spring)]
   focus-visible:outline-none focus-visible:ring-2
   focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2
   disabled:opacity-50 disabled:pointer-events-none
   transform-gpu will-change-transform
   active:scale-[0.97]`,
  {
    variants: {
      variant: {
        primary: `bg-[var(--color-mid)] text-white shadow-[var(--shadow-btn)]
                  hover:scale-[1.02] hover:brightness-110`,
        secondary:`bg-[var(--bg-muted)] text-[var(--text-primary)]
                   border border-[var(--border-card)]
                   hover:scale-[1.02] hover:border-[var(--border-accent)]`,
        ghost:   `bg-transparent text-[var(--text-secondary)]
                  hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]`,
        danger:  `bg-[var(--color-danger)] text-white
                  hover:scale-[1.02] hover:brightness-110`,
        link:    `bg-transparent text-[var(--color-mid)] underline-offset-4
                  hover:underline p-0 h-auto`,
      },
      size: {
        sm:   'h-8  px-3  text-xs  gap-1.5',
        md:   'h-10 px-4  text-sm  gap-2',
        lg:   'h-12 px-6  text-base gap-2.5',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, fullWidth, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        buttonVariants({ variant, size }),
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-1" />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
