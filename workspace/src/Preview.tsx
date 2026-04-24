import { Suspense, lazy, useEffect } from 'react'

const componentName = new URLSearchParams(window.location.search).get('component')

const Component = componentName
  ? lazy(() => import(`./components/${componentName}.tsx`))
  : null

function HeightReporter() {
  useEffect(() => {
    const report = () => {
      const height = document.body.scrollHeight
      window.parent.postMessage({ type: 'pane-resize', name: componentName, height }, '*')
    }
    const observer = new ResizeObserver(report)
    observer.observe(document.body)
    report()
    return () => observer.disconnect()
  }, [])
  return null
}

export default function Preview() {
  if (!Component) {
    return <div className="p-4 text-sm text-neutral-500">No component specified</div>
  }

  return (
    <>
      <HeightReporter />
      <div style={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Suspense fallback={null}>
          <Component />
        </Suspense>
      </div>
    </>
  )
}
