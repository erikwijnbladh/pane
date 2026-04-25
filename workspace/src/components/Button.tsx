import { LucideIcon, Loader2, Plus, Trash2, ArrowRight, MousePointer2 } from 'lucide-react'
import { variant as variants, iconSize } from './tokens'

// ─── Base ─────────────────────────────────────────────────────────────────────

type BaseProps = {
  label: string
  className: string
  icon?: LucideIcon
  iconPos?: 'left' | 'right' | 'only'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
}

function BaseButton({ label, className, icon: Icon, iconPos, loading = false, disabled = false, onClick }: BaseProps) {
  return (
    <button onClick={onClick} disabled={disabled || loading} aria-label={label} className={className}>
      {loading && <Loader2 size={iconSize} className="animate-spin" />}
      {!loading && Icon && (iconPos === 'left' || iconPos === 'only') && <Icon size={iconSize} />}
      {iconPos !== 'only' && label}
      {!loading && Icon && iconPos === 'right' && <Icon size={iconSize} />}
    </button>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────

type Variant = keyof typeof variants

type Props = {
  label: string
  variant?: Variant
  icon?: LucideIcon
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
}

export function Button({ label, variant = 'primary', icon, loading, disabled, onClick }: Props) {
  const { className, icon: iconPos } = variants[variant]
  return <BaseButton label={label} className={className} icon={icon} iconPos={iconPos} loading={loading} disabled={disabled} onClick={onClick} />
}

// ─── Demo ─────────────────────────────────────────────────────────────────────

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      {children}
      <p className="text-[10px] text-neutral-400">{label}</p>
    </div>
  )
}

export default function ButtonDemo() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="rounded-lg border border-dashed border-neutral-200 p-4">
        <p className="mb-3 text-xs font-medium text-neutral-400">Variant</p>
        <div className="flex items-end gap-3">
          <Labeled label="primary"><Button label="Primary" variant="primary" /></Labeled>
          <Labeled label="secondary"><Button label="Secondary" variant="secondary" /></Labeled>
          <Labeled label="tertiary"><Button label="Tertiary" variant="tertiary" /></Labeled>
          <Labeled label="destructive"><Button label="Delete" variant="destructive" /></Labeled>
        </div>
      </div>
      <div className="rounded-lg border border-dashed border-neutral-200 p-4">
        <p className="mb-3 text-xs font-medium text-neutral-400">Icon</p>
        <div className="flex items-end gap-3">
          <Labeled label="primary-icon"><Button label="Add" variant="primary-icon" icon={Plus} /></Labeled>
          <Labeled label="primary-icon-left"><Button label="New" variant="primary-icon-left" icon={Plus} /></Labeled>
          <Labeled label="secondary-icon-right"><Button label="Continue" variant="secondary-icon-right" icon={ArrowRight} /></Labeled>
          <Labeled label="tertiary-icon"><Button label="Select" variant="tertiary-icon" icon={MousePointer2} /></Labeled>
        </div>
      </div>
      <div className="rounded-lg border border-dashed border-neutral-200 p-4">
        <p className="mb-3 text-xs font-medium text-neutral-400">States</p>
        <div className="flex items-end gap-3">
          <Labeled label="disabled"><Button label="Disabled" disabled /></Labeled>
          <Labeled label="loading"><Button label="Save" variant="secondary" loading /></Labeled>
        </div>
      </div>
    </div>
  )
}
