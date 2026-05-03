import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

type ToastType = 'default' | 'success' | 'error' | 'loading'
interface ToastItem { id: string; msg: string; type: ToastType }

let listeners: Array<(t: ToastItem) => void> = []

function emit(t: ToastItem) {
  listeners.forEach(fn => fn(t))
}

function makeId() {
  return Math.random().toString(36).slice(2)
}

const COLORS: Record<ToastType, string> = {
  default: 'var(--bg-card, #1e293b)',
  success: '#166534',
  error:   '#7f1d1d',
  loading: 'var(--bg-card, #1e293b)',
}

const ICONS: Record<ToastType, string> = {
  default: 'ℹ️', success: '✅', error: '❌', loading: '⏳',
}

function toast(msg: string, _opts?: any): string {
  const id = makeId()
  emit({ id, msg, type: 'default' })
  return id
}
toast.success = (msg: string, _opts?: any) => { const id = makeId(); emit({ id, msg, type: 'success' }); return id }
toast.error   = (msg: string, _opts?: any) => { const id = makeId(); emit({ id, msg, type: 'error'   }); return id }
toast.loading = (msg: string, _opts?: any) => { const id = makeId(); emit({ id, msg, type: 'loading' }); return id }
toast.dismiss = (_id?: string) => {}
toast.custom  = (msg: any, _opts?: any) => makeId()
toast.promise = async <T,>(promise: Promise<T>, msgs: { loading: string; success: string; error: string }) => {
  toast.loading(msgs.loading)
  try { const r = await promise; toast.success(msgs.success); return r }
  catch (e) { toast.error(msgs.error); throw e }
}

export { toast }
export const Toast = toast
export default toast

export function Toaster(_props?: any) {
  const [items, setItems] = useState<ToastItem[]>([])

  const add = useCallback((t: ToastItem) => {
    setItems(prev => [...prev, t])
    setTimeout(() => setItems(prev => prev.filter(x => x.id !== t.id)), 3000)
  }, [])

  useEffect(() => {
    listeners.push(add)
    return () => { listeners = listeners.filter(fn => fn !== add) }
  }, [add])

  if (!items.length) return null

  return createPortal(
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8,
      alignItems: 'center', pointerEvents: 'none',
    }}>
      {items.map(t => (
        <div key={t.id} style={{
          background: COLORS[t.type],
          color: '#fff',
          padding: '10px 16px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'toastIn 0.2s ease',
          pointerEvents: 'auto',
        }}>
          <span>{ICONS[t.type]}</span>
          <span>{t.msg}</span>
        </div>
      ))}
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>,
    document.body
  )
}
