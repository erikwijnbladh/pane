import { useRef, useState, type KeyboardEvent } from 'react'
import { Hand, MousePointer2, Save, Share2, Trash2, Undo2, ZoomIn } from 'lucide-react'
import { ButtonRoot } from './Button'

const tools = [
  { id: 'select', label: 'Select', icon: MousePointer2 },
  { id: 'pan', label: 'Pan', icon: Hand },
  { id: 'zoom', label: 'Zoom', icon: ZoomIn },
] as const

// Five use cases of ButtonRoot in one surface:
// icon-only toggles, disabled, loading, danger, primary icon+text.
export default function Toolbar() {
  const [activeTool, setActiveTool] = useState<(typeof tools)[number]['id']>('select')
  const [saving, setSaving] = useState(false)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const save = () => {
    setSaving(true)
    setTimeout(() => setSaving(false), 1200)
  }

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
      className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white p-2 shadow-lg"
    >
      <div className="inline-flex items-center gap-1" onKeyDown={onKeyDown}>
        {tools.map(({ id, label, icon: Icon }, index) => (
          <ButtonRoot
            key={id}
            ref={element => { buttonRefs.current[index] = element }}
            aria-label={label}
            aria-pressed={activeTool === id}
            active={activeTool === id}
            onClick={() => setActiveTool(id)}
            icon={<Icon size={16} strokeWidth={activeTool === id ? 2.4 : 2} />}
          />
        ))}
      </div>

      <div className="mx-1 h-5 w-px bg-stone-200" />

      <ButtonRoot disabled icon={<Undo2 size={16} />}>Undo</ButtonRoot>
      <ButtonRoot loading={saving} icon={<Save size={16} />} onClick={save}>
        {saving ? 'Saving' : 'Save'}
      </ButtonRoot>
      <ButtonRoot variant="danger" icon={<Trash2 size={16} />}>Delete</ButtonRoot>
      <ButtonRoot variant="primary" icon={<Share2 size={16} />}>Share</ButtonRoot>
    </div>
  )
}
