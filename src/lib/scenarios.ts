import type { AppState, Scenario } from '../types'

let counter = 0
export const newId = (): string => `s${Date.now().toString(36)}${(counter += 1)}`

export const blankScenario = (number: number): Scenario => ({
  id: newId(),
  name: `Scenario ${number}`,
  spend: '',
  impressions: '',
  clicks: '',
  conversions: '',
  revenue: '',
})

export const exampleScenarios = (): Scenario[] => [
  { ...blankScenario(1), name: 'Example A (sample)', spend: '20000', impressions: '400000', clicks: '8000', conversions: '240', revenue: '96000' },
  { ...blankScenario(2), name: 'Example B (sample)', spend: '20000', impressions: '250000', clicks: '6500', conversions: '130', revenue: '52000' },
]

export const defaultState = (): AppState => ({ currency: 'PKR', items: [blankScenario(1)] })
