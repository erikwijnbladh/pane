// ─── Design Tokens ────────────────────────────────────────────────────────────

const base = 'inline-flex items-center justify-center font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
const text = (color: string) => `${base} h-8 px-3 rounded-md text-sm ${color}`
const iconOnly = (color: string) => `${base} h-8 w-8 rounded-md ${color}`
const iconLeft = (color: string) => `${base} h-8 px-3 rounded-md text-sm gap-1.5 ${color}`
const iconRight = (color: string) => `${base} h-8 px-3 rounded-md text-sm gap-1.5 ${color}`

const primary     = 'bg-neutral-900 text-white hover:bg-neutral-700 active:bg-black'
const secondary   = 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300'
const tertiary    = 'bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
const destructive = 'bg-red-500 text-white hover:bg-red-400 active:bg-red-600'

export const variant: Record<string, { className: string; icon: 'none' | 'left' | 'right' | 'only' }> = {
  primary:     { className: text(primary),     icon: 'none'  },
  secondary:   { className: text(secondary),   icon: 'none'  },
  tertiary:    { className: text(tertiary),     icon: 'none'  },
  destructive: { className: text(destructive), icon: 'none'  },

  'primary-icon':     { className: iconOnly(primary),     icon: 'only'  },
  'secondary-icon':   { className: iconOnly(secondary),   icon: 'only'  },
  'tertiary-icon':    { className: iconOnly(tertiary),     icon: 'only'  },
  'destructive-icon': { className: iconOnly(destructive), icon: 'only'  },

  'primary-icon-left':     { className: iconLeft(primary),     icon: 'left'  },
  'secondary-icon-left':   { className: iconLeft(secondary),   icon: 'left'  },
  'tertiary-icon-left':    { className: iconLeft(tertiary),     icon: 'left'  },
  'destructive-icon-left': { className: iconLeft(destructive), icon: 'left'  },

  'primary-icon-right':     { className: iconRight(primary),     icon: 'right' },
  'secondary-icon-right':   { className: iconRight(secondary),   icon: 'right' },
  'tertiary-icon-right':    { className: iconRight(tertiary),     icon: 'right' },
  'destructive-icon-right': { className: iconRight(destructive), icon: 'right' },
}

export const iconSize = 14
