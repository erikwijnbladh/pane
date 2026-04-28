import { useRef, useState, type KeyboardEvent } from 'react'
import { Hand, MousePointer2, ZoomIn } from 'lucide-react'
import { ButtonRoot } from './Button'

const tools = [
  { id: 'select', label: 'Select', icon: MousePointer2 },
  { id: 'pan', label: 'Pan', icon: Hand },
  { id: 'zoom', label: 'Zoom', icon: ZoomIn },
] as const

export default function Toolbar() {
  const [activeTool, setActiveTool] = useState<(typeof tools)[number]['id']>('select')
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const focusTool = (index: number) => {
    const nextTool = tools[index]
    setActiveTool(nextTool.id)
    queueMicrotask(() => buttonRefs.current[index]?.focus())
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = tools.findIndex(tool => tool.id === activeTool)
    const keyDirections: Partial<Record<string, -1 | 1>> = {
      ArrowUp: -1,
      ArrowLeft: -1,
      ArrowDown: 1,
      ArrowRight: 1,
    }
    const keyDirection = keyDirections[event.key]

    if (!keyDirection) return

    event.preventDefault()
    focusTool((currentIndex + keyDirection + tools.length) % tools.length)
  }

  return (
    <div
      role="toolbar"
      aria-label="Canvas tools"
      onKeyDown={onKeyDown}
      className="inline-flex flex-col gap-1 rounded-xl border border-stone-200 bg-white p-2 shadow-lg"
    >
      {tools.map(({ id, label, icon: Icon }, index) => (
        <ButtonRoot
          key={id}
          ref={element => { buttonRefs.current[index] = element }}
          aria-label={label}
          aria-pressed={activeTool === id}
          active={activeTool === id}
          onClick={() => setActiveTool(id)}
        >
          <Icon size={16} strokeWidth={activeTool === id ? 2.4 : 2} />
        </ButtonRoot>
      ))}
    </div>
  )
}
