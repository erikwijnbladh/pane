import { useState } from 'react'
import { LucideIcon, MousePointer2 } from 'lucide-react'

type Props = {
  id?: string
  icon?: LucideIcon
  label?: string
  active?: boolean
  defaultActive?: boolean
  onClick?: () => void
  buttonRef?: (el: HTMLButtonElement | null) => void
}

export default function ToolbarButton({
  id,
  icon: Icon = MousePointer2,
  label = 'Tool',
  active: controlledActive,
  defaultActive = false,
  onClick,
  buttonRef,
}: Props) {
  const [internalActive, setInternalActive] = useState(defaultActive)

  const isControlled = controlledActive !== undefined
  const active = isControlled ? controlledActive : internalActive

  const handleClick = () => {
    if (!isControlled) {
      setInternalActive(prev => !prev)
    }
    onClick?.()
  }

  return (
    <button
      id={id}
      ref={buttonRef}
      title={label}
      aria-label={label}
      aria-pressed={active}
      tabIndex={active ? 0 : -1}
      onClick={handleClick}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none outline-none transition-all ${
        active
          ? 'bg-black text-white shadow-sm'
          : 'bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
      }`}
    >
      <Icon size={16} strokeWidth={active ? 2 : 1.5} />
    </button>
  )
}