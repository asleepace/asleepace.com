/**
 * Checks if the market is currently open (9:30 AM - 4:00 PM ET, weekdays only).
 *
 * @note Does not account for market holidays.
 */
export function isMarketOpen(date = new Date()): boolean {
  // Convert to ET (market timezone)
  const etTime = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }))

  const day = etTime.getDay() // 0 = Sunday, 6 = Saturday
  const hours = etTime.getHours()
  const minutes = etTime.getMinutes()

  // Weekend check
  if (day === 0 || day === 6) return false

  // Market hours: 9:30 AM - 4:00 PM ET
  const currentMinutes = hours * 60 + minutes
  const marketOpen = 9 * 60 + 30 // 9:30 AM
  const marketClose = 16 * 60 // 4:00 PM

  return currentMinutes >= marketOpen && currentMinutes < marketClose
}

/**
 * Returns ISO date string (YYYY-MM-DD format).
 */
export function getDateString(date = new Date()): string {
  return date.toISOString().split('T')[0]!
}

/**
 * Gets the next trading day (skips weekends).
 *
 * @note Does not account for market holidays.
 */
export function getNextTradingDay(date: Date = new Date()): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + 1)

  // Skip weekends
  while (next.getDay() === 0 || next.getDay() === 6) {
    next.setDate(next.getDate() + 1)
  }

  return next
}

/**
 * Gets the previous trading day (skips weekends).
 *
 * @note Does not account for market holidays.
 */
export function getPrevTradingDay(date: Date = new Date()): Date {
  const prev = new Date(date)
  prev.setDate(prev.getDate() - 1)

  // Skip weekends
  while (prev.getDay() === 0 || prev.getDay() === 6) {
    prev.setDate(prev.getDate() - 1)
  }

  return prev
}

/**
 * Checks if the given date is today in ET timezone.
 */
export function isTodayET(date: Date): boolean {
  const nowET = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const dateET = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }))

  return (
    dateET.getDate() === nowET.getDate() &&
    dateET.getMonth() === nowET.getMonth() &&
    dateET.getFullYear() === nowET.getFullYear()
  )
}

/**
 * Checks if a given date is for a past trading day.
 * Returns true if the date is before today, or if it's today but past market close (4:00 PM ET).
 *
 * Use this to prevent regenerating old reports.
 */
export function isPastTradingDay(reportDate: Date): boolean {
  const now = new Date()
  const nowET = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const dateET = new Date(reportDate.toLocaleString('en-US', { timeZone: 'America/New_York' }))

  // If report is from a previous day, it's in the past
  if (dateET.toDateString() !== nowET.toDateString()) {
    return dateET < nowET
  }

  // Same day - check if we're past market close (4:00 PM ET)
  const currentMinutes = nowET.getHours() * 60 + nowET.getMinutes()
  const marketClose = 16 * 60 // 4:00 PM

  return currentMinutes >= marketClose
}

/**
 * Checks if the given date is on or before the next trading day.
 */
export function isDuringOrBeforeNextTradingDay(date: Date): boolean {
  const nextTradingDay = getNextTradingDay()
  return date <= nextTradingDay
}

/**
 * Checks if the given date is for the current or next upcoming trading day.
 * Returns false for past trading days and dates too far in the future.
 */
export function isUpcomingOrCurrentTradingDay(date: Date): boolean {
  return !isPastTradingDay(date) && isDuringOrBeforeNextTradingDay(date)
}

export type ElapsedTimes = {
  ms: number
  secs: number
  mins: number
  hours: number
  days: number
}

/**
 * Gets elapsed time since date in different units.
 *
 * @note will return `0` if future date.
 */
export function getElapsedTimeSince(date: Date): ElapsedTimes {
  const elapsed = Date.now() - +date
  if (elapsed < 0) return { ms: 0, mins: 0, secs: 0, hours: 0, days: 0 }
  const ms = elapsed
  const secs = Math.floor(elapsed / 1000)
  const mins = Math.floor(elapsed / (1000 * 60))
  const hours = Math.floor(elapsed / (1000 * 60 * 60))
  const days = Math.floor(elapsed / (1000 * 60 * 60 * 24))
  return { ms, secs, mins, hours, days }
}

/**
 * Shared stock market utilities for date/time validation.
 */
export const stockMarket = {
  isMarketOpen,
  isPastTradingDay,
  isDuringOrBeforeNextTradingDay,
  isUpcomingOrCurrentTradingDay,
  isTodayET,
  getDateString,
  getNextTradingDay,
  getPrevTradingDay,
  getElapsedTimeSince,
}
