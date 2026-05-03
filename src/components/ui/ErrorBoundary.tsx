import { Component, type ReactNode } from 'react'
import { Button } from './Button'

interface Props   { children: ReactNode; fallback?: ReactNode }
interface State   { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) return this.props.fallback

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
           style={{ background: 'var(--bg-base)' }}>
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Xəta baş verdi
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {this.state.error?.message ?? 'Gözlənilməz xəta'}
        </p>
        <Button onClick={() => { this.setState({ hasError: false }); window.location.href = '/' }}>
          Ana səhifəyə qayıt
        </Button>
      </div>
    )
  }
}
