import { ArrowUpRight, CircleDollarSign, LayoutGrid, RadioTower } from 'lucide-react'
import { Button } from './Button'
import { cx, status, tokens, type StatusTone } from './tokens'

const swatches = [
  ['brand', tokens.color.swatch.brand],
  ['accent', tokens.color.swatch.accent],
  ['surface', tokens.color.swatch.surface],
  ['border', tokens.color.swatch.border],
  ['ink', tokens.color.swatch.ink],
] as const

const metrics = [
  { label: 'Adoption', value: '86%', tone: 'success' },
  { label: 'Issues', value: '12', tone: 'warning' },
  { label: 'Views', value: '4.8k', tone: 'neutral' },
] as const

function Metric({ label, value, tone }: { label: string; value: string; tone: StatusTone }) {
  return (
    <div className={`${tokens.surface.card} grid gap-3 p-4`}>
      <div className={tokens.layout.between}>
        <span className={tokens.text.label}>{label}</span>
        <span className={status(tone)}>{tone}</span>
      </div>
      <strong className={tokens.text.metric}>{value}</strong>
    </div>
  )
}

export default function TokenSystem() {
  return (
    <div className={`${tokens.layout.frame} ${tokens.layout.stack}`}>
      <section className={`${tokens.surface.card} overflow-hidden`}>
        <div className={tokens.layout.hero}>
          <div className={tokens.layout.between}>
            <span className={tokens.text.labelOnDark}>token blast radius</span>
            <LayoutGrid size={18} className={tokens.color.accent} />
          </div>

          <div>
            <h1 className={tokens.text.hero}>One file changes the whole surface.</h1>
            <p className={`${tokens.text.bodyOnDark} mt-2.5 max-w-[350px]`}>
              Edit Tailwind recipes in one file and every pane that imports them updates through Vite.
            </p>
          </div>

          <div className="flex gap-2">
            <Button iconAfter={<ArrowUpRight size={14} />}>Ship</Button>
            <Button variant="secondary">Compare</Button>
          </div>
        </div>

        <div className={tokens.layout.section}>
          <div className={tokens.space.grid3}>
            {metrics.map(metric => <Metric key={metric.label} {...metric} />)}
          </div>

          <div className={`${tokens.layout.row} ${tokens.text.body}`}>
            <RadioTower size={16} className={tokens.color.brand} />
            <span>The same semantic recipes drive dashboard, toolbar, and primitive states.</span>
          </div>
        </div>
      </section>

      <section className={`${tokens.surface.card} grid gap-3 p-4`}>
        <div className={tokens.layout.between}>
          <span className={tokens.text.label}>palette</span>
          <CircleDollarSign size={15} className={tokens.color.success} />
        </div>

        <div className={tokens.space.swatches}>
          {swatches.map(([name, value]) => (
            <div key={name} className="grid gap-2">
              <div className={cx('h-[42px] rounded-lg border border-stone-200', value)} />
              <span className={`${tokens.text.label} truncate`}>{name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
