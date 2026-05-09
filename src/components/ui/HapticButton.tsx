// @ts-nocheck
import { forwardRef } from 'react'
import { haptic } from '@/lib/native'

interface HapticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'tap' | 'selection'
  children:    React.ReactNode
}

const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  ({ hapticType = 'light', onClick, children, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      haptic[hapticType]?.()
      onClick?.(e)
    }

    return (
      <button ref={ref} onClick={handleClick} {...props}>
        {children}
      </button>
    )
  }
)

HapticButton.displayName = 'HapticButton'
export default HapticButton
