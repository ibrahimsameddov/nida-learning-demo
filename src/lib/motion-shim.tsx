/**
 * framer-motion shim — animasiyaları plain div/span-a çevirir.
 * Props-ları (initial, animate, whileHover, transition...) alır, amma istifadə etmir.
 */
import { forwardRef, createElement, type ElementType, type HTMLAttributes } from 'react'

type MotionProps = HTMLAttributes<HTMLElement> & {
  initial?: any; animate?: any; exit?: any; variants?: any
  whileHover?: any; whileTap?: any; whileFocus?: any; whileDrag?: any; whileInView?: any
  transition?: any; layout?: any; layoutId?: any
  drag?: any; dragConstraints?: any; dragElastic?: any; dragMomentum?: any
  onAnimationComplete?: any; onHoverStart?: any; onHoverEnd?: any
  onTapStart?: any; onTap?: any; onTapCancel?: any
  custom?: any; inherit?: any; transformTemplate?: any
  viewport?: any; transformValues?: any
  [key: string]: any
}

function makeMotion(tag: ElementType) {
  return forwardRef<HTMLElement, MotionProps>(({
    initial, animate, exit, variants, whileHover, whileTap, whileFocus,
    whileDrag, whileInView, transition, layout, layoutId, drag,
    dragConstraints, dragElastic, dragMomentum, onAnimationComplete,
    onHoverStart, onHoverEnd, onTapStart, onTap, onTapCancel,
    custom, inherit, transformTemplate, viewport, transformValues,
    ...rest
  }, ref) => createElement(tag, { ...rest, ref } as any))
}

const tags = [
  'div','span','p','a','button','h1','h2','h3','h4','h5','h6',
  'ul','ol','li','nav','section','article','header','footer','main',
  'form','input','label','select','textarea','img','svg','path',
] as const

export const motion = new Proxy({} as Record<string, ReturnType<typeof makeMotion>>, {
  get(target, tag: string) {
    if (!target[tag]) target[tag] = makeMotion(tag as ElementType)
    return target[tag]
  },
})

export function AnimatePresence({ children }: { children?: any; mode?: any; initial?: any; onExitComplete?: any }) {
  return children ?? null
}

export function useAnimation() {
  return { start: () => {}, stop: () => {}, set: () => {} }
}

export function useMotionValue(initial: any) {
  return { get: () => initial, set: () => {}, onChange: () => () => {} }
}

export function useTransform(value: any, input: any, output: any) {
  return { get: () => output?.[0] ?? 0, set: () => {} }
}

export function useSpring(value: any) {
  return value
}

export function useScroll() {
  return { scrollY: { get: () => 0, onChange: () => () => {} }, scrollYProgress: { get: () => 0 } }
}

export function useInView() { return false }
export function useAnimate() { return [null, () => {}] }
export function useDragControls() { return {} }
export function useReducedMotion() { return false }

export const LayoutGroup = ({ children }: any) => children ?? null
export const LazyMotion  = ({ children }: any) => children ?? null
export const MotionConfig = ({ children }: any) => children ?? null
export const Reorder      = { Group: ({ children }: any) => children ?? null, Item: makeMotion('div') }

export const domAnimation  = {}
export const domMax        = {}

export default motion
