// @ts-nocheck
import { useState, useRef, useCallback } from 'react'

// ── Swipe to dismiss ───────────────────────────────────────────────────────────

export function useSwipeToDismiss(
  onDismiss: () => void,
  threshold = 100,
) {
  const [translateX, setTranslateX] = useState(0)
  const startX = useRef(0)

  const opacity = Math.max(0, 1 - Math.abs(translateX) / (threshold * 1.5))

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current
    setTranslateX(dx)
  }, [])

  const onTouchEnd = useCallback(() => {
    if (Math.abs(translateX) >= threshold) {
      onDismiss()
    } else {
      setTranslateX(0)
    }
  }, [translateX, threshold, onDismiss])

  return { handlers: { onTouchStart, onTouchMove, onTouchEnd }, translateX, opacity }
}

// ── Swipe navigation (quiz questions) ─────────────────────────────────────────

export function useSwipeNavigation(
  onNext: () => void,
  onPrev: () => void,
  canGoNext: boolean,
  canGoPrev: boolean,
) {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const threshold = 60

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    setIsDragging(true)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current
    const clamped = Math.max(-120, Math.min(120, dx))
    setDragX(clamped)
  }, [])

  const onTouchEnd = useCallback(() => {
    setIsDragging(false)
    if (dragX < -threshold && canGoNext) {
      onNext()
    } else if (dragX > threshold && canGoPrev) {
      onPrev()
    }
    setDragX(0)
  }, [dragX, threshold, canGoNext, canGoPrev, onNext, onPrev])

  return {
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    dragX,
    isDragging,
  }
}

// ── Long press ────────────────────────────────────────────────────────────────

export function useLongPress(onLongPress: () => void, delay = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const start = useCallback(() => {
    timerRef.current = setTimeout(() => {
      onLongPress()
    }, delay)
  }, [onLongPress, delay])

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return {
    onTouchStart: start,
    onTouchEnd:   cancel,
    onMouseDown:  start,
    onMouseUp:    cancel,
    onMouseLeave: cancel,
  }
}

// ── Pull to refresh ───────────────────────────────────────────────────────────

export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  threshold = 80,
) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const pulling = useRef(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
      pulling.current = true
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || isRefreshing) return
    const dy = e.touches[0].clientY - startY.current
    if (dy > 0) {
      setPullDistance(Math.min(dy * 0.5, threshold * 1.5))
    }
  }, [isRefreshing, threshold])

  const onTouchEnd = useCallback(async () => {
    pulling.current = false
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      try { await onRefresh() } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh])

  return {
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    pullDistance,
    isRefreshing,
  }
}
