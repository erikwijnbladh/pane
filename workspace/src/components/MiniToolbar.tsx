import { useState, useRef, KeyboardEvent } from 'react'
import { MousePointer2, Hand, ZoomIn } from 'lucide-react'
import { Button } from './Button'

const tools = [
  { id: 'select', label: 'Select', icon: MousePointer2 },
  { id: 'hand',   label: 'Hand',   icon: Hand          },
  { id: 'zoom',   label: 'Zoom',   icon: ZoomIn        },
] as const

export default function MiniToolbar() {
  const [active, setActive] = useState<string>('select')
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = tools.findIndex(t => t.id === active)
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = (idx + 1) % tools.length
      setActive(tools[next].id)
      queueMicrotask(() => refs.current[next]?.focus())
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = (idx - 1 + tools.length) % tools.length
      setActive(tools[next].id)
      queueMicrotask(() => refs.current[next]?.focus())
    }
  }

  return (
    <div className="flex flex-col items-start gap-3 p-6">
      <div
        role="toolbar"
        aria-label="Drawing tools"
        onKeyDown={onKeyDown}
        className="inline-flex items-center gap-0.5 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-sm"
      >
        {tools.map(({ id, icon, label }, i) => (
          <Button
            key={id}
            variant={active === id ? 'primary-icon' : 'tertiary-icon'}
            icon={icon}
            label={label}
            onClick={() => {
              setActive(id)
              queueMicrotask(() => refs.current[i]?.focus())
            }}
          />
        ))}
      </div>
      <span className="text-xs text-neutral-400">
        {tools.find(t => t.id === active)?.label}
      </span>
    </div>
  )
}
