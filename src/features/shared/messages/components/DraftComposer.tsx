// @ts-nocheck
import { useState, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { generateDraftText, type DraftTemplate, type ContextType, type ContextData } from '@/lib/messaging'
import { haptic } from '@/lib/native'
import TemplateSelector from './TemplateSelector'

interface Props {
  onSend:          (text: string, contextType?: ContextType, contextData?: ContextData) => void
  recipientName?:  string
  templateData?:   Record<string, any>
  placeholder?:    string
  disabled?:       boolean
}

export default function DraftComposer({
  onSend, recipientName, templateData = {}, placeholder = 'Mesajınızı yazın…', disabled,
}: Props) {
  const [text, setText]             = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    haptic.light()
    onSend(trimmed)
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleTemplate = (template: DraftTemplate) => {
    setShowTemplates(false)
    if (template === 'custom') {
      textareaRef.current?.focus()
      return
    }
    const draft = generateDraftText(template, {
      ...templateData,
      studentName: recipientName,
    })
    setText(draft)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  return (
    <>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 8,
        padding: '10px 12px 10px',
        background: 'var(--bg-elevated)',
        borderTop: '0.5px solid var(--border)',
      }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => { haptic.tap(); setShowTemplates(true) }}
            style={{
              padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: 'rgba(201,168,76,0.1)', border: '0.5px solid rgba(201,168,76,0.25)',
              color: 'var(--accent)', cursor: 'pointer',
            }}
          >
            ✨ Şablon
          </button>
        </div>

        {/* Input row */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={autoResize}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            style={{
              flex: 1, resize: 'none', outline: 'none',
              background: 'var(--bg-card)', border: '0.5px solid var(--border)',
              borderRadius: 14, padding: '10px 14px',
              fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5,
              fontFamily: 'inherit', minHeight: 42, maxHeight: 120,
              overflowY: 'auto',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: text.trim() && !disabled ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
              border: 'none', cursor: text.trim() && !disabled ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, transition: 'all 0.2s',
              color: text.trim() && !disabled ? '#1a1200' : 'var(--text-3)',
            }}
          >
            ›
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showTemplates && (
          <TemplateSelector
            onSelect={handleTemplate}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
