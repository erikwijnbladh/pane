import { ArrowRight, Check, Loader2, Plus, Search } from 'lucide-react'
import { button, cx, tokens, type ButtonSize, type ButtonVariant } from './tokens'

type Props = {
  children?: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: React.ReactNode
  iconAfter?: React.ReactNode
  loading?: boolean
  disabled?: boolean
  label?: string
  className?: string
}

export function Button({ children, variant = 'primary', size = 'md', icon, iconAfter, loading = false, disabled = false, label, className }: Props) {
  return (
    <button aria-label={label} className={cx(button(variant, size), className)} disabled={disabled || loading}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
      {iconAfter}
    </button>
  )
}

function DemoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <span className={tokens.text.label}>{label}</span>
      <div className={tokens.space.cluster}>{children}</div>
    </div>
  )
}

export default function ButtonDemo() {
  return (
    <div className={tokens.layout.frame}>
      <div className={`${tokens.surface.card} grid gap-5 p-5`}>
        <div>
          <h2 className={tokens.text.title}>Button system</h2>
          <p className={`${tokens.text.body} mt-1.5`}>
            Variants, icons, and common states from one Tailwind recipe.
          </p>
        </div>

        <DemoRow label="variant">
          <Button icon={<Plus size={14} />}>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </DemoRow>

        <DemoRow label="icon">
          <Button variant="secondary" icon={<Check size={14} />}>Leading</Button>
          <Button variant="secondary" iconAfter={<ArrowRight size={14} />}>Trailing</Button>
          <Button variant="secondary" className="h-9 w-9 px-0" icon={<Search size={16} strokeWidth={2.2} />} label="Search" />
        </DemoRow>

        <DemoRow label="state">
          <Button loading>Loading</Button>
          <Button variant="secondary" disabled>Disabled</Button>
          <Button variant="danger" disabled>Disabled danger</Button>
        </DemoRow>
      </div>
    </div>
  )
}
