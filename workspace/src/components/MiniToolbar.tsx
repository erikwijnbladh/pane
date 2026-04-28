import { useRef, useState, type KeyboardEvent } from 'react'
import { Hand, MousePointer2, PenLine, Sparkles, ZoomIn } from 'lucide-react'
import { iconButton, tokens } from './tokens'

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
    <div className={tokens.layout.frame}>
      <div className={`${tokens.surface.card} p-5`}>
        <div className={`${tokens.layout.between} mb-4`}>
          <div>
            <span className={tokens.text.label}>toolbar</span>
            <h2 className={`${tokens.text.title} mt-1`}>Tokenized controls</h2>
          </div>
        </div>

        <div
          role="toolbar"
          aria-label="Canvas tools"
          onKeyDown={onKeyDown}
          className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 p-2"
        >
          {tools.map(({ id, icon: Icon, label: toolLabel }, i) => {
            const isActive = id === active

            return (
              <button
                key={id}
                ref={el => { refs.current[i] = el }}
                aria-label={toolLabel}
                aria-pressed={isActive}
                onClick={() => setActive(id)}
                className={iconButton(isActive)}
              >
                <Icon size={15} />
              </button>
            )
          })}
        </div>

        <div className={`${tokens.layout.row} mt-4 ${tokens.text.body}`}>
          <Sparkles size={14} className={tokens.color.accent} />
          <span>{tools.find(t => t.id === active)?.label} inherits the same button recipe.</span>
        </div>
      </div>
    </div>
  )
}
