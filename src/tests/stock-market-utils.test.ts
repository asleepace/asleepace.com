/**
 * @file src/tests/stock-market-utils.test.ts
 * @description test suite for stock market utils focused on dates and helpers.
 */
import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { stockMarket } from '@/lib/utils/stock-market'

describe('stockMarket utils', () => {
  let originalDate: typeof Date

  beforeEach(() => {
    originalDate = global.Date
  })

  afterEach(() => {
    global.Date = originalDate
  })

  // Helper to mock current time
  function mockDate(isoString: string) {
    const mockDate = new Date(isoString)
    // @ts-ignore - we're intentionally mocking Date
    global.Date = class extends originalDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(mockDate.getTime())
        } else {
          // @ts-ignore
          super(...args)
        }
      }
      static now() {
        return mockDate.getTime()
      }
    }
  }

  describe('isMarketOpen', () => {
    test('returns true during market hours (10 AM ET)', () => {
      mockDate('2024-12-03T15:00:00Z') // 10 AM ET
      expect(stockMarket.isMarketOpen()).toBe(true)
    })

    test('returns true at market open (9:30 AM ET)', () => {
      mockDate('2024-12-03T14:30:00Z') // 9:30 AM ET
      expect(stockMarket.isMarketOpen()).toBe(true)
    })

    test('returns false before market open (9 AM ET)', () => {
      mockDate('2024-12-03T14:00:00Z') // 9 AM ET
      expect(stockMarket.isMarketOpen()).toBe(false)
    })

    test('returns false after market close (4:30 PM ET)', () => {
      mockDate('2024-12-03T21:30:00Z') // 4:30 PM ET
      expect(stockMarket.isMarketOpen()).toBe(false)
    })

    test('returns false on Saturday', () => {
      mockDate('2024-12-07T15:00:00Z') // Saturday 10 AM ET
      expect(stockMarket.isMarketOpen()).toBe(false)
    })

    test('returns false on Sunday', () => {
      mockDate('2024-12-08T15:00:00Z') // Sunday 10 AM ET
      expect(stockMarket.isMarketOpen()).toBe(false)
    })
  })

  describe('getDateString', () => {
    test('returns ISO date string', () => {
      const date = new Date('2024-12-03T15:30:00Z')
      expect(stockMarket.getDateString(date)).toBe('2024-12-03')
    })
  })

  describe('isTodayET', () => {
    test('returns true for current date in ET', () => {
      mockDate('2024-12-03T15:00:00Z') // Dec 3, 10 AM ET
      const testDate = new Date('2024-12-03T20:00:00Z') // Dec 3, 3 PM ET
      expect(stockMarket.isTodayET(testDate)).toBe(true)
    })

    test('returns false for yesterday', () => {
      mockDate('2024-12-03T15:00:00Z') // Dec 3
      const yesterday = new Date('2024-12-02T15:00:00Z') // Dec 2
      expect(stockMarket.isTodayET(yesterday)).toBe(false)
    })
  })

  describe('getNextTradingDay', () => {
    test('returns next day when current day is weekday', () => {
      const tuesday = new Date('2024-12-03')
      const next = stockMarket.getNextTradingDay(tuesday)
      expect(next.getDay()).toBe(3) // Wednesday
      expect(stockMarket.getDateString(next)).toBe('2024-12-04')
    })

    test('skips weekend from Friday to Monday', () => {
      const friday = new Date('2024-12-06')
      const next = stockMarket.getNextTradingDay(friday)
      expect(next.getDay()).toBe(1) // Monday
      expect(stockMarket.getDateString(next)).toBe('2024-12-09')
    })

    test('skips weekend from Saturday to Monday', () => {
      const saturday = new Date('2024-12-07')
      const next = stockMarket.getNextTradingDay(saturday)
      expect(next.getDay()).toBe(1) // Monday
      expect(stockMarket.getDateString(next)).toBe('2024-12-09')
    })
  })

  describe('getPrevTradingDay', () => {
    test('returns previous day when current day is weekday', () => {
      const wednesday = new Date('2024-12-04')
      const prev = stockMarket.getPrevTradingDay(wednesday)
      expect(prev.getDay()).toBe(2) // Tuesday
      expect(stockMarket.getDateString(prev)).toBe('2024-12-03')
    })

    test('skips weekend from Monday to Friday', () => {
      const monday = new Date('2024-12-09')
      const prev = stockMarket.getPrevTradingDay(monday)
      expect(prev.getDay()).toBe(5) // Friday
      expect(stockMarket.getDateString(prev)).toBe('2024-12-06')
    })
  })

  describe('isPastTradingDay', () => {
    test('returns false for today before market close', () => {
      mockDate('2024-12-03T15:00:00Z') // 10 AM ET
      const today = new Date('2024-12-03T15:00:00Z')
      expect(stockMarket.isPastTradingDay(today)).toBe(false)
    })

    test('returns true for today after market close', () => {
      mockDate('2024-12-03T22:00:00Z') // 5 PM ET (after 4 PM close)
      const today = new Date('2024-12-03T22:00:00Z')
      expect(stockMarket.isPastTradingDay(today)).toBe(true)
    })

    test('returns true for yesterday', () => {
      mockDate('2024-12-03T15:00:00Z')
      const yesterday = new Date('2024-12-02T15:00:00Z')
      expect(stockMarket.isPastTradingDay(yesterday)).toBe(true)
    })

    test('returns false for tomorrow', () => {
      mockDate('2024-12-03T15:00:00Z')
      const tomorrow = new Date('2024-12-04T15:00:00Z')
      expect(stockMarket.isPastTradingDay(tomorrow)).toBe(false)
    })
  })

  describe('isDuringOrBeforeNextTradingDay', () => {
    test('returns true for today', () => {
      mockDate('2024-12-03T15:00:00Z') // Tuesday
      const today = new Date('2024-12-03T15:00:00Z')
      expect(stockMarket.isDuringOrBeforeNextTradingDay(today)).toBe(true)
    })

    test('returns true for next trading day', () => {
      mockDate('2024-12-03T15:00:00Z') // Tuesday
      const wednesday = new Date('2024-12-04T15:00:00Z')
      expect(stockMarket.isDuringOrBeforeNextTradingDay(wednesday)).toBe(true)
    })

    test('returns false for day after next trading day', () => {
      mockDate('2024-12-03T15:00:00Z') // Tuesday
      const thursday = new Date('2024-12-05T15:00:00Z')
      expect(stockMarket.isDuringOrBeforeNextTradingDay(thursday)).toBe(false)
    })
  })

  describe('isUpcomingOrCurrentTradingDay', () => {
    test('returns true for today before market close', () => {
      mockDate('2024-12-03T15:00:00Z') // 10 AM ET
      const today = new Date('2024-12-03T15:00:00Z')
      expect(stockMarket.isUpcomingOrCurrentTradingDay(today)).toBe(true)
    })

    test('returns false for today after market close', () => {
      mockDate('2024-12-03T22:00:00Z') // 5 PM ET
      const today = new Date('2024-12-03T22:00:00Z')
      expect(stockMarket.isUpcomingOrCurrentTradingDay(today)).toBe(false)
    })

    test('returns true for next trading day', () => {
      mockDate('2024-12-03T15:00:00Z')
      const tomorrow = new Date('2024-12-04T15:00:00Z')
      expect(stockMarket.isUpcomingOrCurrentTradingDay(tomorrow)).toBe(true)
    })

    test('returns false for past days', () => {
      mockDate('2024-12-03T15:00:00Z')
      const yesterday = new Date('2024-12-02T15:00:00Z')
      expect(stockMarket.isUpcomingOrCurrentTradingDay(yesterday)).toBe(false)
    })

    test('returns false for days too far in future', () => {
      mockDate('2024-12-03T15:00:00Z') // Tuesday
      const thursday = new Date('2024-12-05T15:00:00Z')
      expect(stockMarket.isUpcomingOrCurrentTradingDay(thursday)).toBe(false)
    })
  })
})
