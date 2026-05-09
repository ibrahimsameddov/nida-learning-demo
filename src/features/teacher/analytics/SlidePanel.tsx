// @ts-nocheck
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const SPRING = { type: 'spring', stiffness: 320, damping: 28 }
const WIDTH_MAP = { sm: 340, md: 440, lg: 560 }

interface PanelConfig {
  id:        string
  title:     string
  subtitle?: string
  width?:    'sm' | 'md' | 'lg'
  content:   React.ReactNode
}

interface SlidePanelCtx {
  stack: PanelConfig[]
  push:  (cfg: PanelConfig) => void
  pop:   () => void
  clear: () => void
  popTo: (idx: number) => void
}

const Ctx = createContext<SlidePanelCtx>({
  stack: [], push: () => {}, pop: () => {}, clear: () => {}, popTo: () => {},
})

export function usePanels() { return useContext(Ctx) }

export function SlidePanelProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<PanelConfig[]>([])
  const push  = useCallback((cfg: PanelConfig) => setStack(s => [...s.slice(-2), cfg]), [])
  const pop   = useCallback(() => setStack(s => s.slice(0, -1)), [])
  const clear = useCallback(() => setStack([]), [])
  const popTo = useCallback((idx: number) => setStack(s => s.slice(0, idx + 1)), [])

  return (
    <Ctx.Provider value={{ stack, push, pop, clear, popTo }}>
      {children}
      <SlidePanelRenderer stack={stack} pop={pop} clear={clear} popTo={popTo} />
    </Ctx.Provider>
  )
}

function SlidePanelRenderer({
  stack, pop, clear, popTo,
}: {
  stack: PanelConfig[]
  pop:   () => void
  clear: () => void
  popTo: (idx: number) => void
}) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const open     = stack.length > 0
  const panel    = stack[stack.length - 1]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) pop() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, pop])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="slide-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => pop()}
          style={{
            position: 'fixed', inset: 0, zIndex: 600,
            background: isMobile ? 'var(--bg-overlay)' : 'rgba(0,0,0,0.32)',
            backdropFilter: isMobile ? 'blur(12px)' : undefined,
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'stretch',
            justifyContent: isMobile ? 'center' : 'flex-end',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={panel?.id}
              initial={isMobile ? { y: '100%' } : { x: '100%' }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: '100%' } : { x: '100%' }}
              transition={SPRING}
              onClick={e => e.stopPropagation()}
              style={{
                ...(isMobile
                  ? { width: '100%', maxHeight: '88vh', borderRadius: '20px 20px 0 0' }
                  : { width: WIDTH_MAP[panel?.width ?? 'md'], height: '100%' }
                ),
                background: 'var(--bg-card)',
                border: '0.5px solid var(--border)',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.22)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {isMobile && (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4, flexShrink: 0 }}>
                  <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
                </div>
              )}

              {/* Header */}
              <div style={{
                padding: isMobile ? '8px 20px 14px' : '20px 20px 14px',
                borderBottom: '0.5px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
              }}>
                {stack.length > 1 && (
                  <button onClick={pop} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 22, color: 'var(--text-3)', padding: '0 4px', flexShrink: 0, lineHeight: 1,
                  }}>‹</button>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {stack.length > 1 && (
                    <p style={{
                      fontSize: 10, color: 'var(--primary)', fontFamily: 'var(--font-mono)',
                      marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {stack.slice(0, -1).map((p, i) => (
                        <span key={p.id}>
                          <button
                            onClick={() => popTo(i)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              fontSize: 10, color: 'var(--primary)', padding: 0, fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {p.title}
                          </button>
                          {' › '}
                        </span>
                      ))}
                    </p>
                  )}
                  <p style={{
                    fontSize: 15, fontWeight: 800, color: 'var(--text-1)',
                    fontFamily: 'var(--font-heading)', lineHeight: 1.2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {panel?.title}
                  </p>
                  {panel?.subtitle && (
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>
                      {panel.subtitle}
                    </p>
                  )}
                </div>
                <button onClick={clear} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 20, color: 'var(--text-3)', flexShrink: 0, padding: 4,
                }}>✕</button>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 36px' }}>
                {panel?.content}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
