import { useRef, useState, type KeyboardEvent } from 'react'
import { Hand, MousePointer2, PenLine, ZoomIn } from 'lucide-react'

const tools = [
  { id: 'select', label: 'Select', icon: MousePointer2 },
  { id: 'pan', label: 'Pan', icon: Hand },
  { id: 'draw', label: 'Draw', icon: PenLine },
  { id: 'zoom', label: 'Zoom', icon: ZoomIn },
] as const

export default function MiniToolbar() {
  const [active, setActive] = useState<(typeof tools)[number]['id']>('select')
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = tools.findIndex(t => t.id === active)
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowDown' && e.key !== 'ArrowLeft' && e.key !== 'ArrowUp') return

    e.preventDefault()
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1
    const next = (idx + step + tools.length) % tools.length
    setActive(tools[next].id)
    queueMicrotask(() => refs.current[next]?.focus())
  }

  return (
    <div
      role="toolbar"
      aria-label="Canvas tools"
      onKeyDown={onKeyDown}
      className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white p-2 shadow-sm"
    >
      {tools.map(({ id, icon: Icon, label }, i) => {
        const isActive = id === active

        return (
          <button
            key={id}
            ref={el => { refs.current[i] = el }}
            aria-label={label}
            aria-pressed={isActive}
            onClick={() => setActive(id)}
            className={[
              'inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors',
              isActive
                ? 'border-neutral-950 bg-neutral-950 text-white'
                : 'border-stone-200 bg-white text-neutral-500 hover:bg-stone-50 hover:text-neutral-950',
            ].join(' ')}
          >
            <Icon size={15} />
          </button>
        )
      })}
    </div>
  )
}
