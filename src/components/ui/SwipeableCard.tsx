// @ts-nocheck
import { motion } from 'framer-motion'
import { useSwipeToDismiss } from '@/hooks/useGestures'

interface Props {
  onDismiss:        () => void
  children:         React.ReactNode
  dismissDirection?: 'left' | 'right' | 'both'
  threshold?:       number
  style?:           React.CSSProperties
  className?:       string
}

export default function SwipeableCard({
  onDismiss, children, style, className, threshold = 100,
}: Props) {
  const { handlers, translateX, opacity } = useSwipeToDismiss(onDismiss, threshold)

  return (
    <motion.div
      style={{ translateX, opacity, touchAction: 'pan-y', ...style }}
      className={className}
      {...handlers}
    >
      {children}
    </motion.div>
  )
}
