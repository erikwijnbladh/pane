import { useRef, useState, useCallback, useEffect } from 'react'
import type { Pane } from './App'

type Props = {
  panes: Pane[]
  setPanes: React.Dispatch<React.SetStateAction<Pane[]>>
  selected: string | null
  setSelected: (id: string) => void
  onDelete: (id: string) => void
}

export default function Canvas({ panes, setPanes, selected, setSelected, onDelete }: Props) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const draggingCanvas = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const draggingPane = useRef<{
    id: string; startX: number; startY: number; mouseX: number; mouseY: number
  } | null>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const paneRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({})

  const stopAll = useCallback(() => {
    draggingCanvas.current = false
    draggingPane.current = null
    setIsDragging(false)
  }, [])

  useEffect(() => {
    window.addEventListener('mouseup', stopAll)
    return () => window.removeEventListener('mouseup', stopAll)
  }, [stopAll])

  useEffect(() => {
    if (worldRef.current) {
      worldRef.current.style.setProperty('transform', `translate(${offset.x}px, ${offset.y}px) scale(${scale})`)
    }
  }, [offset, scale])

  useEffect(() => {
    for (const pane of panes) {
      const paneEl = paneRefs.current[pane.id]
      if (paneEl) {
        paneEl.style.setProperty('left', `${pane.x}px`)
        paneEl.style.setProperty('top', `${pane.y}px`)
        paneEl.style.setProperty('width', `${pane.width}px`)
      }

      const iframeEl = iframeRefs.current[pane.id]
      if (iframeEl) {
        iframeEl.style.setProperty('height', `${pane.height}px`)
        iframeEl.style.setProperty('pointer-events', selected === pane.id && !isDragging ? 'auto' : 'none')
      }
    }
  }, [panes, selected, isDragging])

  // Auto-resize panes based on content height reported from iframes
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'pane-resize' && e.data.name) {
        setPanes(prev => prev.map(p =>
          p.id === e.data.name ? { ...p, height: e.data.height } : p
        ))
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [setPanes])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-pane]')) return
    draggingCanvas.current = true
    setIsDragging(true)
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingPane.current) {
      const { id, startX, startY, mouseX, mouseY } = draggingPane.current
      const dx = (e.clientX - mouseX) / scale
      const dy = (e.clientY - mouseY) / scale
      setPanes(prev => prev.map(p => p.id === id ? { ...p, x: startX + dx, y: startY + dy } : p))
      return
    }
    if (!draggingCanvas.current) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    setOffset(o => ({ x: o.x + dx, y: o.y + dy }))
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }, [scale])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (e.ctrlKey) {
      const factor = 1 - e.deltaY * 0.01
      setScale(s => Math.min(5, Math.max(0.1, s * factor)))
    } else {
      setOffset(o => ({ x: o.x - e.deltaX, y: o.y - e.deltaY }))
    }
  }, [])

  const startDragPane = (e: React.MouseEvent, pane: Pane) => {
    e.stopPropagation()
    draggingPane.current = { id: pane.id, startX: pane.x, startY: pane.y, mouseX: e.clientX, mouseY: e.clientY }
    setIsDragging(true)
    setSelected(pane.id)
  }

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onWheel={onWheel}
      className="relative h-full w-full cursor-default overflow-hidden bg-[#f5f5f5]"
    >
      <div className="absolute right-4 top-3 z-10 inline-flex select-none rounded bg-white/70  font-mono text-xs px-2 py-1 text-neutral-500 shadow-sm backdrop-blur-sm">
        {Math.round(scale * 100)}%
      </div>

      <div ref={worldRef} className="absolute left-0 top-0 origin-top-left">
        {panes.map(pane => (
          <div
            key={pane.id}
            ref={(el) => { paneRefs.current[pane.id] = el }}
            data-pane
            onMouseDown={(e) => startDragPane(e, pane)}
            className={`absolute cursor-grab overflow-hidden rounded-[10px] bg-white transition-shadow ${selected === pane.id ? 'shadow-[0_0_0_2px_#3b82f6,_0_4px_24px_rgba(0,0,0,0.12)]' : 'shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_16px_rgba(0,0,0,0.1)]'}`}
          >
            <div className="flex h-7 select-none items-center justify-between border-b border-[#eee] bg-[#fafafa] px-[10px]">
              <span className="font-mono text-[11px] text-[#999]">{pane.name}</span>
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); onDelete(pane.id) }}
                className="cursor-pointer border-0 bg-transparent px-[2px] text-sm leading-none text-[#ccc] transition-colors hover:text-[#999]"
              >
                ×
              </button>
            </div>
            <iframe
              ref={(el) => { iframeRefs.current[pane.id] = el }}
              src={`http://localhost:5174?component=${pane.name}`}
              className="block w-full border-0"
              title={pane.name}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
