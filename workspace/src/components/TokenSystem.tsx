import { LayoutGrid } from 'lucide-react'

export default function TokenSystem() {
  return (
    <section className="grid gap-4 rounded-xl border border-stone-200 bg-white p-5 font-sans text-neutral-950 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-[11px] text-neutral-400">token system</span>
        <LayoutGrid size={16} className="text-neutral-400" />
      </div>
      <div>
        <h2 className="text-lg font-bold tracking-normal">Standalone legacy demo</h2>
        <p className="mt-1.5 text-[13px] leading-5 text-neutral-500">
          This file no longer drives the current canvas demo.
        </p>
      </div>
    </section>
  )
}
