import { useState, useRef, KeyboardEvent } from 'react'
import { MousePointer2, Hand, ZoomIn } from 'lucide-react'
import ToolbarButton from './ToolbarButton'


const tools = [
  { id: 'select', label: 'Select (V)', icon: MousePointer2 },
  { id: 'hand', label: 'Hand (H)', icon: Hand },
  { id: 'zoom', label: 'Zoom (Z)', icon: ZoomIn },
]

export default function MiniToolbar() {
  const [active, setActive] = useState('select')
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const moveFocus = (index: number) => {
    queueMicrotask(() => refs.current[index]?.focus())
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = tools.findIndex(t => t.id === active)

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIdx = (idx + 1) % tools.length
      setActive(tools[nextIdx].id)
      moveFocus(nextIdx)
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const nextIdx = (idx - 1 + tools.length) % tools.length
      setActive(tools[nextIdx].id)
      moveFocus(nextIdx)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 p-1">
      <div
        role="toolbar"
        aria-label="Drawing tools"
        onKeyDown={onKeyDown}
        className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-2 py-2 shadow-sm"
      >
        {tools.map((tool, i) => (
          <ToolbarButton
            key={tool.id}
            id={`tool-${tool.id}`}
            icon={tool.icon}
            label={tool.label}
            active={active === tool.id}
            onClick={() => {
              setActive(tool.id)
              moveFocus(i)
            }}
            buttonRef={el => {
              refs.current[i] = el
            }}
          />
        ))}
      </div>

      <span className="font-mono text-xs text-neutral-500">
        {tools.find(t => t.id === active)?.label}
      </span>
    </div>
  )
}