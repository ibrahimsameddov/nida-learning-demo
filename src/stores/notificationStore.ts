import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Notification } from '../types/models'

interface NotificationState {
  items:      Notification[]
  unreadCount:number
  add:        (n: Notification) => void
  markRead:   (id: string) => void
  markAllRead:() => void
  remove:     (id: string) => void
}

export const useNotificationStore = create<NotificationState>()(
  immer(set => ({
    items:       [],
    unreadCount: 0,

    add: (n) => set(s => {
      s.items.unshift(n)
      if (!n.read) s.unreadCount++
    }),
    markRead: (id) => set(s => {
      const item = s.items.find(i => i.id === id)
      if (item && !item.read) {
        item.read = true
        s.unreadCount = Math.max(0, s.unreadCount - 1)
      }
    }),
    markAllRead: () => set(s => {
      s.items.forEach(i => (i.read = true))
      s.unreadCount = 0
    }),
    remove: (id) => set(s => {
      const idx = s.items.findIndex(i => i.id === id)
      if (idx !== -1) {
        if (!s.items[idx].read) s.unreadCount--
        s.items.splice(idx, 1)
      }
    }),
  }))
)
