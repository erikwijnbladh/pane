export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export const tokens = {
  frame: 'font-sans text-neutral-950',
  card: 'rounded-xl border border-stone-200 bg-white shadow-sm',
  section: 'grid gap-3 p-5',
  label: 'font-mono text-[11px] text-neutral-400',
  body: 'text-[13px] leading-5 text-neutral-500',
} as const
