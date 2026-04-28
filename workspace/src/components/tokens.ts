export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export const tokens = {
  layout: {
    frame: 'min-w-[360px] font-sans text-neutral-950',
    stack: 'grid gap-4',
    section: 'grid gap-4 p-5',
    hero: 'grid gap-5 bg-neutral-950 p-6 text-white',
    row: 'flex items-center gap-2',
    between: 'flex items-center justify-between gap-4',
  },
  surface: {
    card: 'rounded-xl border border-stone-200 bg-white shadow-sm',
    inset: 'rounded-xl border border-stone-200 bg-stone-50',
    dark: 'rounded-xl bg-neutral-950 text-white',
  },
  text: {
    label: 'font-mono text-[11px] text-neutral-400',
    labelOnDark: 'font-mono text-[11px] text-neutral-300',
    title: 'text-lg font-bold leading-tight tracking-normal text-neutral-950',
    hero: 'text-2xl font-bold leading-tight tracking-normal text-white',
    body: 'text-[13px] leading-5 text-neutral-500',
    bodyOnDark: 'text-sm leading-5 text-neutral-300',
    metric: 'text-3xl font-bold leading-none tracking-normal text-neutral-950',
  },
  color: {
    brand: 'text-blue-600',
    accent: 'text-orange-500',
    success: 'text-emerald-700',
    muted: 'text-neutral-500',
    swatch: {
      brand: 'bg-blue-600',
      accent: 'bg-orange-500',
      surface: 'bg-white',
      border: 'bg-stone-200',
      ink: 'bg-neutral-950',
    },
  },
  space: {
    cluster: 'flex flex-wrap items-center gap-2',
    grid3: 'grid grid-cols-3 gap-3',
    swatches: 'grid grid-cols-5 gap-2',
  },
} as const

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md'
export type StatusTone = 'neutral' | 'success' | 'warning'

const buttonBase = 'inline-flex items-center justify-center gap-2 rounded-md border text-[13px] font-medium leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const buttonVariant: Record<ButtonVariant, string> = {
  primary: 'border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-500',
  secondary: 'border-stone-300 bg-white text-neutral-950 shadow-sm hover:bg-stone-50',
  ghost: 'border-transparent bg-transparent text-neutral-500 hover:bg-stone-100 hover:text-neutral-950',
  danger: 'border-red-600 bg-red-600 text-white hover:bg-red-500',
}

const buttonSize: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4',
}

export function button(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return cx(buttonBase, buttonVariant[variant], buttonSize[size])
}

export function iconButton(active = false) {
  return cx(button(active ? 'primary' : 'ghost', 'sm'), 'h-[34px] w-[34px] px-0')
}

export function status(tone: StatusTone) {
  const tones: Record<StatusTone, string> = {
    neutral: 'border-stone-200 bg-stone-50 text-neutral-500',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-orange-200 bg-orange-50 text-orange-700',
  }

  return cx('inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium', tones[tone])
}
