import { io, Socket } from 'socket.io-client'
import { useAuthStore }         from '../stores/authStore'
import { useNotificationStore }  from '../stores/notificationStore'
import type { Notification }     from '../types/models'

// Socket devre dışı bırakılabilir — backend olmayan demo modunda hata spamını önler
const SOCKET_ENABLED = import.meta.env.VITE_SOCKET_ENABLED === 'true'
const WS_URL         = import.meta.env.VITE_WS_URL ?? 'http://localhost:8080'

class SocketService {
  private socket:      Socket | null = null
  private listeners  = new Map<string, Set<Function>>()
  private connectTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * connect() küçük bir gecikmeyle çalışır.
   * React StrictMode dev'de effect'i hemen mount+unmount eder;
   * gecikme sayesinde cleanup bu timer'ı iptal edebilir ve
   * "WebSocket closed before established" hatası oluşmaz.
   */
  connect() {
    if (!SOCKET_ENABLED) return
    if (this.socket?.connected) return

    // Önceki bekleyen bağlantı varsa iptal et
    if (this.connectTimer) {
      clearTimeout(this.connectTimer)
      this.connectTimer = null
    }

    this.connectTimer = setTimeout(() => {
      this.connectTimer = null
      const token = useAuthStore.getState().token
      if (!token) return

      this.socket = io(WS_URL, {
        auth:                 { token },
        transports:           ['websocket'],
        reconnection:         true,
        reconnectionAttempts: 3,
        reconnectionDelay:    2000,
        reconnectionDelayMax: 10_000,
        timeout:              5000,
      })

      this.socket.on('connect', () => {
        console.info('[Socket] Qoşuldu')
      })

      this.socket.on('disconnect', (reason) => {
        // Bağlantı kəsilməsi — yalnız gözlənilməz hallarda warn et
        if (reason !== 'io client disconnect') {
          console.warn('[Socket] Ayrıldı:', reason)
        }
      })

      this.socket.on('connect_error', (err) => {
        // Xəta — yalnız bir dəfə warn (reconnect loop'da spam olmasın)
        if (!this.socket?.active) return
        console.warn('[Socket] Bağlantı xətası:', err.message)
      })

      // Qlobal hadisələr
      this.socket.on('notification', (n: Notification) => {
        useNotificationStore.getState().add(n)
      })

      // Əvvəlcədən qeydiyyatlı listener-ləri bərpa et
      this.listeners.forEach((fns, event) => {
        fns.forEach(fn => this.socket!.on(event, fn as never))
      })
    }, 150) // StrictMode cleanup üçün yetərli gecikme
  }

  disconnect() {
    // Hələ qoşulmamış, yalnız timer gözləyir — ləğv et
    if (this.connectTimer) {
      clearTimeout(this.connectTimer)
      this.connectTimer = null
      return
    }
    this.socket?.disconnect()
    this.socket = null
  }

  on<T>(event: string, fn: (data: T) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(fn)
    this.socket?.on(event, fn)

    return () => {
      this.listeners.get(event)?.delete(fn)
      this.socket?.off(event, fn)
    }
  }

  emit<T>(event: string, data: T) {
    if (!this.socket?.connected) {
      console.warn('[Socket] Qoşulmayıb, emit edilmir:', event)
      return
    }
    this.socket.emit(event, data)
  }

  get isConnected() {
    return this.socket?.connected ?? false
  }
}

export const socketService = new SocketService()

