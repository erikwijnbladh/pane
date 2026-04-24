import { useState } from 'react'
import { MousePointer2, LucideIcon } from 'lucide-react'

type Props = {
  id?: string
  icon: LucideIcon
  label: string
  active?: boolean
  onClick?: () => void
  buttonRef?: (el: HTMLButtonElement | null) => void
}

export function ToolbarButton({ id, icon: Icon, label, active, onClick, buttonRef }: Props) {
  return (
    <button
      id={id}
      ref={buttonRef}
      title={label}
      aria-label={label}
      aria-pressed={active}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none outline-none transition-colors ${
        active
          ? 'bg-black text-white'
          : 'bg-transparent text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700'
      }`}
    >
      <Icon size={16} strokeWidth={active ? 2 : 1.5} />
    </button>
  )
}

export default function ToolbarButtonDemo() {
  const [active, setActive] = useState(false)
  return (
    <ToolbarButton
      icon={MousePointer2}
      label="Select"
      active={active}
      onClick={() => setActive(a => !a)}
    />
  )
}
