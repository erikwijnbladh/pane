import { Component as ReactComponent, Suspense, lazy, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'

const componentName = new URLSearchParams(window.location.search).get('component') || 'Toolbar'

// Dev path: real files on disk, updated by Vite HMR.
// Static/hosted path: initial render from the built chunk, then live
// re-renders from the in-memory files the editor posts into this iframe.
const StaticComponent = lazy(() => import(`./components/${componentName}.tsx`))

class Boundary extends ReactComponent<{ children: ReactNode; onError: (message: string) => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error) {
    this.props.onError(error.message)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function HeightReporter() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return
    const report = () => {
      const height = root.scrollHeight
      window.parent.postMessage({ type: 'pane-resize', name: componentName, height }, '*')
    }
    const observer = new ResizeObserver(report)
    observer.observe(root)
    report()
    return () => observer.disconnect()
  }, [])
  return null
}

export default function Preview() {
  const [live, setLive] = useState<{ Comp: ComponentType; version: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const liveRef = useRef(live)
  liveRef.current = live
  const versionRef = useRef(0)

  useEffect(() => {
    if (import.meta.env.DEV) return

    import('@tailwindcss/browser') // browser JIT so newly typed classes get CSS

    const handler = async (e: MessageEvent) => {
      if (e.data?.type !== 'pane-files' || !e.data.files) return
      try {
        const { evaluate } = await import('./livePreview')
        const mod = evaluate(componentName, e.data.files)
        const Comp = mod.default
        if (typeof Comp !== 'function') throw new Error(`${componentName} has no default export component`)
        versionRef.current += 1
        setLive({ Comp: Comp as ComponentType, version: versionRef.current })
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    }
    window.addEventListener('message', handler)
    window.parent.postMessage({ type: 'pane-ready', name: componentName }, '*')
    return () => window.removeEventListener('message', handler)
  }, [])

  const Comp = live?.Comp
  return (
    <>
      <HeightReporter />
      {error && (
        <div
          style={{
            position: 'fixed',
            left: 8,
            right: 8,
            bottom: 8,
            zIndex: 10,
            borderRadius: 8,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            font: '11px/1.5 ui-monospace, monospace',
            padding: '6px 10px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {error}
        </div>
      )}
      <div style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Boundary
          key={live ? `live-${live.version}` : 'static'}
          onError={message => { if (liveRef.current) setError(message) }}
        >
          <Suspense fallback={null}>
            {Comp ? <Comp /> : <StaticComponent />}
          </Suspense>
        </Boundary>
      </div>
    </>
  )
}
