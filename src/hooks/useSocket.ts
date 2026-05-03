import { useEffect, useRef } from 'react'
import { socketService } from '../lib/socket'
import { useAuthStore } from '../stores/authStore'

export function useSocketConnection() {
  const token = useAuthStore(s => s.token)

  useEffect(() => {
    if (!token) return
    socketService.connect()
    return () => socketService.disconnect()
  }, [token])
}

export function useSocketEvent<T>(event: string, handler: (data: T) => void) {
  // Ref ile her zaman en güncel handler'ı tut —
  // böylece useEffect yalnızca `event` değiştiğinde yeniden çalışır.
  const handlerRef = useRef(handler)
  useEffect(() => { handlerRef.current = handler })

  useEffect(() => {
    const stableHandler = (data: T) => handlerRef.current(data)
    const cleanup = socketService.on<T>(event, stableHandler)
    return cleanup
  }, [event])
}

