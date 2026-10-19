import { calculate, consistencyWarnings, fieldErrors } from '../lib/calc'
import { money, percent, times } from '../lib/format'
import { FIELD_KEYS, FIELD_LABELS, type FieldKey, type Metrics, type Scenario } from '../types'
import Field from './Field'

interface Props {
  scenario: Scenario
  currency: string
  canRemove: boolean
  onChange: (key: 'name' | FieldKey, value: string) => void
  onRemove: () => void
}

const METRICS: [keyof Metrics, string, (value: number | null, currency: string) => string][] = [
  ['ctr', 'CTR', (v) => percent(v)],
  ['cpc', 'CPC', money],
  ['cpm', 'CPM', money],
  ['cvr', 'Conv. rate', (v) => percent(v)],
  ['cpa', 'CPA', money],
  ['roas', 'ROAS', (v) => times(v)],
  ['roi', 'ROI', (v) => percent(v)],
]

export default function ScenarioCard({ scenario, currency, canRemove, onChange, onRemove }: Props) {
  const metrics = calculate(scenario)
  const errors = fieldErrors(scenario)
  const warnings = consistencyWarnings(scenario)
  return (
    <section className="card" aria-label={scenario.name || 'Scenario'}>
      <div className="row">
        <input
          className="name"
          value={scenario.name}
          maxLength={60}
          aria-label="Scenario name"
          onChange={(event) => onChange('name', event.target.value)}
        />
        {canRemove && (
          <button type="button" className="ghost" aria-label={`Remove ${scenario.name}`} onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
      <div className="grid">
        {FIELD_KEYS.map((key) => (
          <Field key={key} label={FIELD_LABELS[key]} value={scenario[key]} error={errors[key]} onChange={(value) => onChange(key, value)} />
        ))}
      </div>
      {warnings.map((text) => <p key={text} className="warn">{text}</p>)}
      <dl className="metrics">
        {METRICS.map(([key, label, format]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{format(metrics[key], currency)}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
