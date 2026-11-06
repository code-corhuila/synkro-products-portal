import { safeText } from './safeText'

describe('safeText', () => {
  it.each(['=SUM(A1:A2)', '+1', '-1', '@today()', '\tindented', '\rcarriage'])(
    'prefixes an apostrophe when the value starts with %j',
    (value) => {
      expect(safeText(value)).toBe(`'${value}`)
    },
  )

  it.each(['Wireless mouse', 'c-1', '', 'A product named =not-a-formula'])(
    'leaves %j untouched',
    (value) => {
      expect(safeText(value)).toBe(value)
    },
  )
})
