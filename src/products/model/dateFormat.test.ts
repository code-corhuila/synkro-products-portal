import { createDateFormatter } from './dateFormat'

describe('createDateFormatter', () => {
  it('writes the date and the time in Spanish (Colombia), in the time zone it is given', () => {
    const format = createDateFormatter('America/Bogota')

    expect(format('2026-10-10T15:49:00Z')).toMatch(/10 oct 2026.*10:49/)
  })

  it('moves the same instant with the time zone, so tests are deterministic', () => {
    expect(createDateFormatter('UTC')('2026-10-10T15:49:00Z')).toMatch(/10 oct 2026.*3:49/)
    expect(createDateFormatter('Asia/Tokyo')('2026-10-10T15:49:00Z')).toMatch(/11 oct 2026.*12:49/)
  })

  it('uses the browser time zone when none is given', () => {
    expect(createDateFormatter()('2026-10-10T15:49:00Z')).toMatch(/oct 2026/)
  })

  it.each(['', 'not a date'])('writes a dash for "%s"', (value) => {
    expect(createDateFormatter('UTC')(value)).toBe('—')
  })
})
