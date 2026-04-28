import { Suspense, lazy, useEffect } from 'react'

const componentName = new URLSearchParams(window.location.search).get('component') || 'Toolbar'

const Component = lazy(() => import(`./components/${componentName}.tsx`))

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
  return (
    <>
      <HeightReporter />
      <div style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Suspense fallback={null}>
          <Component />
        </Suspense>
      </div>
    </>
  )
}
