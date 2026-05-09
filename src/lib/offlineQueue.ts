// @ts-nocheck

const QUEUE_KEY = 'nida-offline-queue'

export interface QueuedAction {
  id:        string
  type:      'save_result' | 'mark_read' | 'send_message' | 'complete_task' | 'mark_notification_read'
  data:      Record<string, any>
  timestamp: number
  retries:   number
}

const MAX_RETRIES = 3

function getQueue(): QueuedAction[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveQueue(queue: QueuedAction[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } catch {}
}

// ── Action executors ───────────────────────────────────────────────────────────

async function executeAction(action: QueuedAction): Promise<void> {
  // Lazy import to avoid circular deps
  const { dbSaveTestResult, dbMarkNotificationRead } = await import('./db')

  switch (action.type) {
    case 'save_result':
      await dbSaveTestResult(action.data as any)
      break
    case 'mark_notification_read':
      await dbMarkNotificationRead(action.data.id)
      break
    case 'mark_read':
      // handled by markMessageRead from messaging.ts
      const { markMessageRead } = await import('./messaging')
      await markMessageRead(action.data.messageId, action.data.uid)
      break
    default:
      break
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const offlineQueue = {
  add(action: Omit<QueuedAction, 'id' | 'retries'>): void {
    const queue = getQueue()
    queue.push({ ...action, id: crypto.randomUUID(), retries: 0 })
    saveQueue(queue)
  },

  async process(): Promise<void> {
    if (!navigator.onLine) return
    const queue = getQueue()
    if (!queue.length) return

    const remaining: QueuedAction[] = []

    for (const action of queue) {
      try {
        await executeAction(action)
        // Success — don't add back to queue
      } catch {
        if (action.retries + 1 >= MAX_RETRIES) {
          console.warn('[OfflineQueue] Discarding action after max retries:', action.type)
        } else {
          remaining.push({ ...action, retries: action.retries + 1 })
        }
      }
    }

    saveQueue(remaining)
  },

  getQueue,

  count(): number {
    return getQueue().length
  },

  clear(): void {
    saveQueue([])
  },
}

// ── Auto-process when back online ────────────────────────────────────────────

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    offlineQueue.process().catch(() => {})
  })
}
