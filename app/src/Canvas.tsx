import { useRef, useState, useCallback, useEffect } from 'react'
import { LayersPlus, Moon, Palette, SquareDashed, Sun } from 'lucide-react'
import type { Pane } from './App'

function ToolbarBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  const [tip, setTip] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setTip(true)}
        onMouseLeave={() => setTip(false)}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
      >
        {children}
      </button>
      {tip && (
        <div className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-neutral-800 px-2.5 py-1 text-[11px] text-white shadow-lg">
          {label}
        </div>
      )}
    </div>
  )
}

type Group = {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
}

type Props = {
  panes: Pane[]
  setPanes: React.Dispatch<React.SetStateAction<Pane[]>>
  selected: string | null
  setSelected: (id: string) => void
  onDelete: (id: string) => void
  onAddComponent: () => void
  onOpenTokens: () => void
  previewUrl: string
}

export default function Canvas({ panes, setPanes, selected, setSelected, onDelete, onAddComponent, onOpenTokens, previewUrl }: Props) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)

  const draggingCanvas = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const draggingPane = useRef<{ id: string; startX: number; startY: number; mouseX: number; mouseY: number } | null>(null)
  const draggingGroup = useRef<{ id: string; startX: number; startY: number; mouseX: number; mouseY: number } | null>(null)
  const resizingGroup = useRef<{ id: string; startW: number; startH: number; mouseX: number; mouseY: number } | null>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const paneRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({})

  const stopAll = useCallback(() => {
    draggingCanvas.current = false
    draggingPane.current = null
    draggingGroup.current = null
    resizingGroup.current = null
    setIsDragging(false)
  }, [])

  useEffect(() => {
    window.addEventListener('mouseup', stopAll)
    return () => window.removeEventListener('mouseup', stopAll)
  }, [stopAll])

  useEffect(() => {
    if (worldRef.current)
      worldRef.current.style.transform = `translate(${offset.x}px, ${offset.y}px) scale(${scale})`
  }, [offset, scale])

  useEffect(() => {
    for (const pane of panes) {
      const el = paneRefs.current[pane.id]
      if (el) {
        el.style.left = `${pane.x}px`
        el.style.top = `${pane.y}px`
        el.style.width = `${pane.width}px`
      }
      const iframe = iframeRefs.current[pane.id]
      if (iframe) {
        iframe.style.height = `${pane.height}px`
        iframe.style.pointerEvents = selected === pane.id && !isDragging ? 'auto' : 'none'
      }
    }
  }, [panes, selected, isDragging])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'pane-resize' && e.data.name) {
        setPanes(prev => prev.map(p => p.id === e.data.name ? { ...p, height: e.data.height } : p))
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [setPanes])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-pane]')) return
    if ((e.target as HTMLElement).closest('[data-group]')) return
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
    if (draggingGroup.current) {
      const { id, startX, startY, mouseX, mouseY } = draggingGroup.current
      const dx = (e.clientX - mouseX) / scale
      const dy = (e.clientY - mouseY) / scale
      setGroups(prev => prev.map(g => g.id === id ? { ...g, x: startX + dx, y: startY + dy } : g))
      return
    }
    if (resizingGroup.current) {
      const { id, startW, startH, mouseX, mouseY } = resizingGroup.current
      const dx = (e.clientX - mouseX) / scale
      const dy = (e.clientY - mouseY) / scale
      setGroups(prev => prev.map(g => g.id === id ? { ...g, width: Math.max(120, startW + dx), height: Math.max(80, startH + dy) } : g))
      return
    }
    if (!draggingCanvas.current) return
    setOffset(o => ({ x: o.x + e.clientX - lastMouse.current.x, y: o.y + e.clientY - lastMouse.current.y }))
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }, [scale])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (e.ctrlKey) {
      const newScale = Math.min(5, Math.max(0.1, scale * (1 - e.deltaY * 0.01)))
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      setOffset(o => ({
        x: mouseX - (mouseX - o.x) * (newScale / scale),
        y: mouseY - (mouseY - o.y) * (newScale / scale),
      }))
      setScale(newScale)
    } else {
      setOffset(o => ({ x: o.x - e.deltaX, y: o.y - e.deltaY }))
    }
  }, [scale])

  const startDragPane = (e: React.MouseEvent, pane: Pane) => {
    e.stopPropagation()
    draggingPane.current = { id: pane.id, startX: pane.x, startY: pane.y, mouseX: e.clientX, mouseY: e.clientY }
    setIsDragging(true)
    setSelected(pane.id)
  }

  const startDragGroup = (e: React.MouseEvent, group: Group) => {
    e.stopPropagation()
    draggingGroup.current = { id: group.id, startX: group.x, startY: group.y, mouseX: e.clientX, mouseY: e.clientY }
    setIsDragging(true)
  }

  const startResizeGroup = (e: React.MouseEvent, group: Group) => {
    e.stopPropagation()
    e.preventDefault()
    resizingGroup.current = { id: group.id, startW: group.width, startH: group.height, mouseX: e.clientX, mouseY: e.clientY }
    setIsDragging(true)
  }

  const addGroup = useCallback(() => {
    const id = `group-${Date.now()}`
    setGroups(prev => [...prev, {
      id,
      label: 'Group',
      x: (-offset.x + 120) / scale,
      y: (-offset.y + 120) / scale,
      width: 500,
      height: 340,
    }])
  }, [offset, scale])

  // G key to add group
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        addGroup()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [addGroup])

  const dotColor = darkMode ? '%23374151' : '%23d1d5db'
  const dotGridBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='1' cy='1' r='1' fill='${dotColor}'/%3E%3C/svg%3E")`
  const bgColor = darkMode ? '#18181b' : '#f5f5f3'

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onWheel={onWheel}
      className="relative h-full w-full cursor-default overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: bgColor, backgroundImage: dotGridBg }}
    >
      {/* Toolbar */}
      <div className="absolute left-4 top-4 z-10 flex flex-col items-center gap-0.5 rounded-2xl bg-white p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.06]">
        <ToolbarBtn label="New component" onClick={onAddComponent}>
          <LayersPlus size={16} />
        </ToolbarBtn>
        <ToolbarBtn label="Open tokens" onClick={onOpenTokens}>
          <Palette size={16} />
        </ToolbarBtn>
        <ToolbarBtn label="Add group" onClick={addGroup}>
          <SquareDashed size={16} />
        </ToolbarBtn>
        <div className="my-0.5 h-px w-5 bg-neutral-100" />
        <ToolbarBtn label={darkMode ? 'Light workspace' : 'Dark workspace'} onClick={() => setDarkMode(d => !d)}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </ToolbarBtn>
      </div>

      {/* Scale indicator */}
      <div className="absolute right-4 top-3 z-10 select-none font-mono text-xs px-2 py-1 text-neutral-400">
        {Math.round(scale * 100)}%
      </div>

      <div ref={worldRef} className="absolute left-0 top-0 origin-top-left">
        {/* Groups — rendered behind panes */}
        {groups.map(group => (
          <div
            key={group.id}
            data-group
            onMouseDown={e => startDragGroup(e, group)}
            className="absolute cursor-grab select-none rounded-2xl"
            style={{
              left: group.x,
              top: group.y,
              width: group.width,
              height: group.height,
              background: 'rgba(0,0,0,0.03)',
              border: '1.5px dashed #d1d5db',
            }}
          >
            {/* Label */}
            {editingGroup === group.id ? (
              <input
                autoFocus
                defaultValue={group.label}
                onMouseDown={e => e.stopPropagation()}
                onBlur={e => {
                  setGroups(prev => prev.map(g => g.id === group.id ? { ...g, label: e.target.value || 'Group' } : g))
                  setEditingGroup(null)
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === 'Escape') (e.target as HTMLInputElement).blur()
                }}
                className="absolute -top-3 left-3 rounded bg-white px-2 py-0.5 text-[11px] font-medium text-neutral-500 shadow-sm outline-none ring-1 ring-blue-400"
                style={{ minWidth: 60 }}
              />
            ) : (
              <span
                onMouseDown={e => e.stopPropagation()}
                onDoubleClick={() => setEditingGroup(group.id)}
                className="absolute -top-3 left-3 cursor-text rounded bg-white px-2 py-0.5 text-[11px] font-medium text-neutral-400 shadow-sm ring-1 ring-black/5"
              >
                {group.label}
              </span>
            )}

            {/* Delete */}
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => setGroups(prev => prev.filter(g => g.id !== group.id))}
              className="absolute right-2 top-2 cursor-pointer border-0 bg-transparent text-sm leading-none text-neutral-300 transition-colors hover:text-neutral-500"
            >
              ×
            </button>

            {/* Resize handle */}
            <div
              onMouseDown={e => startResizeGroup(e, group)}
              className="absolute bottom-0 right-0 h-5 w-5 cursor-nwse-resize"
              style={{ background: 'linear-gradient(135deg, transparent 50%, #d1d5db 50%)' }}
            />
          </div>
        ))}

        {/* Panes */}
        {panes.map(pane => (
          <div
            key={pane.id}
            ref={el => { paneRefs.current[pane.id] = el }}
            data-pane
            onMouseDown={e => startDragPane(e, pane)}
            className={`absolute cursor-grab overflow-hidden rounded-[10px] bg-white transition-shadow ${
              selected === pane.id
                ? 'shadow-[0_0_0_2px_#3b82f6,_0_4px_24px_rgba(0,0,0,0.12)]'
                : 'shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_16px_rgba(0,0,0,0.1)]'
            }`}
          >
            {/* Title bar */}
            <div className="flex h-7 select-none items-center justify-between border-b border-[#eee] bg-[#fafafa] px-2.5">
              <span className="font-mono text-[11px] text-[#999]">{pane.name}</span>
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); onDelete(pane.id) }}
                className="cursor-pointer border-0 bg-transparent px-0.5 text-sm leading-none text-[#ccc] transition-colors hover:text-[#999]"
              >
                ×
              </button>
            </div>

            {/* Preview */}
            <iframe
              ref={el => { iframeRefs.current[pane.id] = el }}
              src={`${previewUrl}?component=${encodeURIComponent(pane.name)}`}
              className="block w-full border-0"
              title={pane.name}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
