// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => window.localStorage.clear())
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const setup = () => ({ user: userEvent.setup(), ...render(<App />) })
const card = (name: string) => screen.getByRole('region', { name })

describe('AdMath', () => {
  it('starts with one empty scenario and a prompt', () => {
    setup()
    expect(screen.getAllByLabelText('Scenario name')).toHaveLength(1)
    expect(screen.getByText('Enter spend and revenue to compare.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /^Remove/ })).toBeNull()
  })

  it('shows the hand-checked results for the sample numbers and picks the best return', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Load sample numbers' }))
    const a = within(card('Example A (sample)'))
    expect(a.getByText('4.8x')).toBeTruthy() // ROAS
    expect(a.getByText('380%')).toBeTruthy() // ROI
    expect(a.getByText('PKR 2.5')).toBeTruthy() // CPC
    expect(screen.getByText('Example A (sample) (4.8x)')).toBeTruthy()
    expect(screen.getByRole('img', { name: /Example A \(sample\) 4\.8x, Example B \(sample\) 2\.6x/ })).toBeTruthy()
  })

  it('allows at most four scenarios and lets one be removed', async () => {
    const { user } = setup()
    const add = screen.getByRole('button', { name: 'Add scenario' }) as HTMLButtonElement
    for (let i = 0; i < 3; i += 1) await user.click(add)
    expect(screen.getAllByLabelText('Scenario name')).toHaveLength(4)
    expect(add.disabled).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Remove Scenario 2' }))
    expect(screen.getAllByLabelText('Scenario name')).toHaveLength(3)
    expect(add.disabled).toBe(false)
  })

  it('calculates as the person types', async () => {
    const { user } = setup()
    const scenario = within(card('Scenario 1'))
    await user.type(scenario.getByLabelText('Ad spend'), '1000')
    await user.type(scenario.getByLabelText('Impressions'), '50000')
    await user.type(scenario.getByLabelText('Clicks'), '500')
    expect(scenario.getByText('1%')).toBeTruthy() // CTR
    expect(scenario.getByText('PKR 20')).toBeTruthy() // CPM
  })

  it('explains a negative number instead of using it silently', async () => {
    const { user } = setup()
    const spend = within(card('Scenario 1')).getByLabelText('Ad spend')
    await user.type(spend, '-5')
    expect(screen.getByText('Ad spend: Use a number of 0 or more.')).toBeTruthy()
    expect(spend.getAttribute('aria-invalid')).toBe('true')
    await user.clear(spend)
    expect(screen.queryByText(/Use a number of 0 or more/)).toBeNull()
  })

  it('warns when clicks are higher than impressions', async () => {
    const { user } = setup()
    const scenario = within(card('Scenario 1'))
    await user.type(scenario.getByLabelText('Impressions'), '100')
    await user.type(scenario.getByLabelText('Clicks'), '500')
    expect(screen.getByText('Clicks are higher than impressions. Check the numbers.')).toBeTruthy()
  })

  it('uses the currency the person types', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Load sample numbers' }))
    const currency = screen.getByLabelText('Currency')
    await user.clear(currency)
    await user.type(currency, 'USD')
    expect(within(card('Example A (sample)')).getByText('USD 2.5')).toBeTruthy()
  })

  it('remembers the scenarios between visits', async () => {
    const { user, unmount } = setup()
    await user.click(screen.getByRole('button', { name: 'Load sample numbers' }))
    unmount()
    render(<App />)
    expect(card('Example B (sample)')).toBeTruthy()
  })

  it('opens normally when the saved data is broken', () => {
    window.localStorage.setItem('admath.v1', '{not json')
    setup()
    expect(screen.getAllByLabelText('Scenario name')).toHaveLength(1)
  })

  it('opens data saved by the first version of the app', () => {
    window.localStorage.setItem('admath.v1', JSON.stringify({ cur: 'USD', items: [{ id: 1.76e12, name: 'Old scenario', spend: '100', impressions: '', clicks: '', conversions: '', revenue: '300' }] }))
    setup()
    expect(within(card('Old scenario')).getByText('3x')).toBeTruthy() // ROAS 300 / 100
  })

  it('exports a CSV file', async () => {
    const createObjectURL = vi.fn(() => 'blob:test')
    const revokeObjectURL = vi.fn()
    Object.assign(URL, { createObjectURL, revokeObjectURL })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Export CSV' }))
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    const blob = (createObjectURL.mock.calls[0] as unknown as [Blob])[0]
    expect(blob.type).toBe('text/csv;charset=utf-8')
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('resets to one empty scenario', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Load sample numbers' }))
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getAllByLabelText('Scenario name')).toHaveLength(1)
    expect(screen.getByText('Enter spend and revenue to compare.')).toBeTruthy()
  })
})
