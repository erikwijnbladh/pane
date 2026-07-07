import { forwardRef } from 'react'
import { Loader2, MousePointer2, Share2, Trash2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

type ButtonRootProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  active?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

// The shared knobs. Change gap/padding/radius here and every button
// on the canvas — Toolbar included — follows on save.
const base =
  'inline-flex items-center justify-center gap-1.5 rounded-md border font-medium transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20 disabled:pointer-events-none disabled:opacity-45'

const sizes: Record<Size, { labeled: string; iconOnly: string }> = {
  sm: { labeled: 'h-8 px-2.5 text-xs', iconOnly: 'h-8 w-8' },
  md: { labeled: 'h-9 px-3 text-[13px]', iconOnly: 'h-9 w-9' },
}

const variants: Record<Variant, string> = {
  primary: 'border-neutral-950 bg-neutral-950 text-white shadow-sm hover:bg-neutral-800',
  secondary: 'border-stone-200 bg-white text-neutral-600 shadow-sm hover:bg-stone-50 hover:text-neutral-950',
  ghost: 'border-transparent text-neutral-600 hover:bg-stone-100 hover:text-neutral-950',
  danger: 'border-red-200 bg-white text-red-600 shadow-sm hover:border-red-300 hover:bg-red-50',
}

export const ButtonRoot = forwardRef<HTMLButtonElement, ButtonRootProps>(function ButtonRoot(
  { variant = 'secondary', size = 'md', active = false, loading = false, icon, className = '', children, disabled, ...props },
  ref
) {
  const iconOnly = !children
  return (
    <button
      {...props}
      ref={ref}
      disabled={disabled || loading}
      className={[
        base,
        iconOnly ? sizes[size].iconOnly : sizes[size].labeled,
        active ? variants.primary : variants[variant],
        className,
      ].join(' ')}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  )
})

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <span className="font-mono text-[11px] text-neutral-400">{label}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

export default function ButtonDemo() {
  return (
    <div className="grid gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-lg">
      <Row label="variants">
        <ButtonRoot variant="primary" icon={<Share2 size={16} />}>Share</ButtonRoot>
        <ButtonRoot icon={<MousePointer2 size={16} />}>Select</ButtonRoot>
        <ButtonRoot variant="ghost">Ghost</ButtonRoot>
        <ButtonRoot variant="danger" icon={<Trash2 size={16} />}>Delete</ButtonRoot>
      </Row>
      <Row label="states">
        <ButtonRoot loading>Saving</ButtonRoot>
        <ButtonRoot disabled icon={<Share2 size={16} />}>Disabled</ButtonRoot>
        <ButtonRoot active icon={<MousePointer2 size={16} />}>Active</ButtonRoot>
      </Row>
      <Row label="sizes + icon-only">
        <ButtonRoot size="sm">Small</ButtonRoot>
        <ButtonRoot size="md">Medium</ButtonRoot>
        <ButtonRoot size="sm" aria-label="Select" icon={<MousePointer2 size={14} />} />
        <ButtonRoot aria-label="Select" active icon={<MousePointer2 size={16} />} />
      </Row>
    </div>
  )
}
