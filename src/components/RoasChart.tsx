import { calculate } from '../lib/calc'
import { times } from '../lib/format'
import type { Scenario } from '../types'

const ROW = 40

export default function RoasChart({ items }: { items: readonly Scenario[] }) {
  const rows = items.map((item) => ({ id: item.id, name: item.name || 'Untitled', roas: calculate(item).roas }))
  const max = Math.max(1, ...rows.map((row) => row.roas ?? 0))
  const description = rows.map((row) => `${row.name} ${times(row.roas)}`).join(', ')
  return (
    <svg viewBox={`0 0 600 ${rows.length * ROW + 10}`} className="chart" role="img" aria-label={`ROAS by scenario: ${description}`}>
      {rows.map((row, index) => {
        const width = Math.max(2, ((row.roas ?? 0) / max) * 400)
        return (
          <g key={row.id}>
            <text x={0} y={index * ROW + 24} className="lbl">
              {row.name.length > 16 ? `${row.name.slice(0, 15)}…` : row.name}
              <title>{row.name}</title>
            </text>
            <rect x={130} y={index * ROW + 8} rx={4} height={22} width={width} className="bar" />
            <text x={138 + width} y={index * ROW + 24} className="val">{times(row.roas)}</text>
          </g>
        )
      })}
    </svg>
  )
}
