'use client'
import { Component, ReactNode } from 'react'

interface State { hasError: boolean }

export default class SceneBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() { return { hasError: true } }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center"
          style={{ background: 'var(--color-surface)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            WebGL not available
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
