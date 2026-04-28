import { forwardRef } from 'react'
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
