export const DEMO_FILE_CONTENTS: Record<string, string> = {
  'tokens.ts': `export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export const tokens = {
  frame: 'font-sans text-neutral-950',
  card: 'rounded-xl border border-stone-200 bg-white shadow-sm',
  section: 'grid gap-3 p-5',
  label: 'font-mono text-[11px] text-neutral-400',
  body: 'text-[13px] leading-5 text-neutral-500',
} as const
`,

  'Button.tsx': `import { forwardRef } from 'react'
import { MousePointer2 } from 'lucide-react'

type ButtonRootProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}

export const ButtonRoot = forwardRef<HTMLButtonElement, ButtonRootProps>(function ButtonRoot(
  { active = false, className = '', children, ...props },
  ref
) {
  return (
    <button
      {...props}
      ref={ref}
      className={[
        'inline-flex h-9 w-9 items-center justify-center rounded-md border transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20',
        active
          ? 'border-neutral-950 bg-neutral-950 text-white shadow-sm'
          : 'border-stone-200 bg-white text-neutral-600 shadow-sm hover:bg-stone-50 hover:text-neutral-950',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
})

export default function ButtonDemo() {
  return (
    <div className="inline-flex rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
      <ButtonRoot aria-label="Select" active>
        <MousePointer2 size={16} />
      </ButtonRoot>
    </div>
  )
}
`,

  'Toolbar.tsx': `import { useRef, useState, type KeyboardEvent } from 'react'
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
`,
}
