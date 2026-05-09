import { useState, useCallback, useRef, useEffect } from 'react'
import type { Layout, Layouts } from 'react-grid-layout'
import { dbGetDashboardLayout, dbSaveDashboardLayout } from '@/lib/db'

export type SaveStatus = 'idle' | 'saving' | 'saved'

const WIDGET_IDS = ['hero', 'level', 'stats', 'subjects', 'results', 'quick-nav'] as const

function buildLgLayout(weakCount: number): Layout[] {
  const subH = 7 + Math.min(weakCount * 2, 4)
  return [
    { i: 'hero',      x: 0, y: 0,        w: 8,  h: 4,    minW: 4, minH: 3 },
    { i: 'level',     x: 8, y: 0,        w: 4,  h: 4,    minW: 3, minH: 3 },
    { i: 'stats',     x: 0, y: 4,        w: 12, h: 3,    minW: 6, minH: 2 },
    { i: 'subjects',  x: 0, y: 7,        w: 6,  h: subH, minW: 4, minH: 5 },
    { i: 'results',   x: 6, y: 7,        w: 6,  h: subH, minW: 4, minH: 4 },
    { i: 'quick-nav', x: 0, y: 7 + subH, w: 12, h: 5,    minW: 6, minH: 3 },
  ]
}

function buildSmLayout(): Layout[] {
  return [
    { i: 'hero',      x: 0, y: 0,  w: 1, h: 5,  static: true },
    { i: 'level',     x: 0, y: 5,  w: 1, h: 4,  static: true },
    { i: 'stats',     x: 0, y: 9,  w: 1, h: 3,  static: true },
    { i: 'subjects',  x: 0, y: 12, w: 1, h: 9,  static: true },
    { i: 'results',   x: 0, y: 21, w: 1, h: 6,  static: true },
    { i: 'quick-nav', x: 0, y: 27, w: 1, h: 4,  static: true },
  ]
}

function sanitizeLg(saved: Layout[]): Layout[] {
  const ids = new Set(saved.map(l => l.i))
  const base = buildLgLayout(0)
  const merged = saved.map(s => {
    const def = base.find(b => b.i === s.i)
    return { ...def, ...s }
  })
  base.forEach(b => { if (!ids.has(b.i)) merged.push(b) })
  return merged.filter(l => WIDGET_IDS.includes(l.i as any))
}

export function useDashboardLayout(weakCount: number) {
  const [layouts, setLayouts] = useState<Layouts>({
    lg: buildLgLayout(weakCount),
    sm: buildSmLayout(),
  })
  const [loaded, setLoaded]     = useState(false)
  const [saveStatus, setSave]   = useState<SaveStatus>('idle')
  const saveTimer   = useRef<ReturnType<typeof setTimeout>>()
  const statusTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    dbGetDashboardLayout()
      .then(saved => {
        if (saved?.layouts?.lg?.length) {
          setLayouts({ lg: sanitizeLg(saved.layouts.lg), sm: buildSmLayout() })
        } else {
          setLayouts({ lg: buildLgLayout(weakCount), sm: buildSmLayout() })
        }
        setLoaded(true)
      })
      .catch(() => {
        setLayouts({ lg: buildLgLayout(weakCount), sm: buildSmLayout() })
        setLoaded(true)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onLayoutChange = useCallback((_: Layout[], all: Layouts) => {
    const lg = all.lg ?? []
    setLayouts(prev => ({ ...prev, lg }))
    clearTimeout(saveTimer.current)
    clearTimeout(statusTimer.current)
    setSave('saving')
    saveTimer.current = setTimeout(() => {
      dbSaveDashboardLayout({ lg }).then(() => {
        setSave('saved')
        statusTimer.current = setTimeout(() => setSave('idle'), 2000)
      }).catch(() => setSave('idle'))
    }, 1500)
  }, [])

  const resetLayout = useCallback(() => {
    const fresh: Layouts = { lg: buildLgLayout(weakCount), sm: buildSmLayout() }
    setLayouts(fresh)
    dbSaveDashboardLayout({ lg: fresh.lg }).catch(() => {})
  }, [weakCount])

  return { layouts, loaded, saveStatus, onLayoutChange, resetLayout }
}
