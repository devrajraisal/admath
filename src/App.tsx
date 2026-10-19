import { useEffect, useState } from 'react'
import RoasChart from './components/RoasChart'
import ScenarioCard from './components/ScenarioCard'
import { bestReturn } from './lib/calc'
import { downloadCsv } from './lib/csv'
import { times } from './lib/format'
import { blankScenario, exampleScenarios } from './lib/scenarios'
import { loadState, saveState } from './lib/storage'
import { MAX_SCENARIOS, type AppState, type Scenario } from './types'

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState())
  useEffect(() => saveState(state), [state])

  const { items, currency } = state
  const best = bestReturn(items)
  const setItems = (update: (current: Scenario[]) => Scenario[]) =>
    setState((current) => ({ ...current, items: update(current.items) }))

  return (
    <main>
      <h1>AdMath</h1>
      <p className="sub">Compare ad campaign scenarios. Enter your numbers and see CTR, CPC, CPM, CPA, ROAS and ROI.</p>

      <div className="bar-top">
        <button type="button" disabled={items.length >= MAX_SCENARIOS} onClick={() => setItems((all) => [...all, blankScenario(all.length + 1)])}>
          Add scenario
        </button>
        <button type="button" className="ghost" onClick={() => setItems(() => exampleScenarios())}>Load sample numbers</button>
        <button type="button" className="ghost" onClick={() => downloadCsv(items)}>Export CSV</button>
        <button type="button" className="ghost" onClick={() => setItems(() => [blankScenario(1)])}>Reset</button>
        <label className="cur">
          Currency
          <input value={currency} maxLength={4} onChange={(event) => setState((current) => ({ ...current, currency: event.target.value }))} />
        </label>
      </div>

      <div className="cards">
        {items.map((scenario, index) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            currency={currency}
            canRemove={items.length > 1}
            onChange={(key, value) => setItems((all) => all.map((item, i) => (i === index ? { ...item, [key]: value } : item)))}
            onRemove={() => setItems((all) => all.filter((_, i) => i !== index))}
          />
        ))}
      </div>

      <section className="panel">
        <h2>ROAS comparison</h2>
        {best ? (
          <p>Best return: <span className="best">{`${best.name} (${times(best.roas)})`}</span></p>
        ) : (
          <p>Enter spend and revenue to compare.</p>
        )}
        <RoasChart items={items} />
      </section>

      <footer>
        Built by Devraj Raisal. All calculations run in your browser and nothing is sent anywhere. Sample numbers are not real campaign data.
      </footer>
    </main>
  )
}
