// @ts-nocheck
import { useState, useEffect, useRef } from 'react'

// ── Haptic feedback ────────────────────────────────────────────────────────────

export const haptic = {
  light:       () => { try { if ('vibrate' in navigator) navigator.vibrate(10) } catch {} },
  medium:      () => { try { if ('vibrate' in navigator) navigator.vibrate(25) } catch {} },
  heavy:       () => { try { if ('vibrate' in navigator) navigator.vibrate([40, 10, 40]) } catch {} },
  success:     () => { try { if ('vibrate' in navigator) navigator.vibrate([10, 50, 10]) } catch {} },
  error:       () => { try { if ('vibrate' in navigator) navigator.vibrate([50, 30, 50, 30, 50]) } catch {} },
  quizCorrect: () => { try { if ('vibrate' in navigator) navigator.vibrate(15) } catch {} },
  quizWrong:   () => { try { if ('vibrate' in navigator) navigator.vibrate([60, 20, 60]) } catch {} },
  tap:         () => { try { if ('vibrate' in navigator) navigator.vibrate(6) } catch {} },
  selection:   () => { try { if ('vibrate' in navigator) navigator.vibrate(8) } catch {} },
}

// ── Share Sheet ────────────────────────────────────────────────────────────────

export async function shareResult(data: {
  title: string
  text: string
  score?: number
  subject?: string
}): Promise<boolean> {
  const shareData = {
    title: data.title,
    text:  `NIDA — ${data.text}`,
    url:   window.location.origin,
  }
  if (navigator.share && navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData)
      return true
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        // fallthrough to clipboard
      } else {
        return false
      }
    }
  }
  try {
    await navigator.clipboard.writeText(`${data.title}\n${data.text}\nnida.az`)
    return false // clipboard fallback used
  } catch {
    return false
  }
}

// ── Push notification ─────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

// ── A2HS install prompt ────────────────────────────────────────────────────────

let _deferredPrompt: any = null

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault()
    _deferredPrompt = e
  })
}

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
    setIsInstalled(standalone)

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    const check = () => setCanInstall(!!_deferredPrompt)
    check()

    const handler = (e: any) => {
      e.preventDefault()
      _deferredPrompt = e
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setCanInstall(false)
      _deferredPrompt = null
    })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!_deferredPrompt) return false
    _deferredPrompt.prompt()
    const { outcome } = await _deferredPrompt.userChoice
    _deferredPrompt = null
    setCanInstall(false)
    return outcome === 'accepted'
  }

  return { canInstall, isInstalled, isIOS, install }
}

// ── Network status ─────────────────────────────────────────────────────────────

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const conn = typeof navigator !== 'undefined' ? (navigator as any).connection : null
  const [connectionType, setConnectionType] = useState<string | null>(conn?.type ?? null)
  const [effectiveType, setEffectiveType] = useState<string | null>(conn?.effectiveType ?? null)

  useEffect(() => {
    const onOnline  = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    const onChange  = () => {
      const c = (navigator as any).connection
      setConnectionType(c?.type ?? null)
      setEffectiveType(c?.effectiveType ?? null)
    }

    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    const c = (navigator as any).connection
    c?.addEventListener('change', onChange)

    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
      c?.removeEventListener('change', onChange)
    }
  }, [])

  return { isOnline, connectionType, effectiveType }
}

// ── Screen orientation lock ───────────────────────────────────────────────────

export async function lockPortrait(): Promise<void> {
  try {
    if (screen.orientation?.lock) {
      await screen.orientation.lock('portrait')
    }
  } catch { /* not all browsers support this */ }
}

export function unlockOrientation(): void {
  try {
    if (screen.orientation?.unlock) {
      screen.orientation.unlock()
    }
  } catch {}
}

// ── Wake lock ─────────────────────────────────────────────────────────────────

export async function requestWakeLock(): Promise<any> {
  try {
    if ('wakeLock' in navigator) {
      return await (navigator as any).wakeLock.request('screen')
    }
  } catch {}
  return null
}

// ── Visibility change helper ──────────────────────────────────────────────────

export function useVisibilityChange(onHide: () => void, onShow?: () => void) {
  useEffect(() => {
    const handler = () => {
      if (document.hidden) onHide()
      else onShow?.()
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [onHide, onShow])
}
