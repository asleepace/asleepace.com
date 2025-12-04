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
 * Gets the ET time as formatted components for any date.
 */
export function getCurrentETComponents(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date) // Use passed date
  const values: Record<string, string> = {}

  parts.forEach(({ type, value }) => {
    values[type] = value
  })

  return {
    year: parseInt(values.year),
    month: parseInt(values.month),
    day: parseInt(values.day),
    hour: parseInt(values.hour),
    minute: parseInt(values.minute),
    second: parseInt(values.second),
  }
}

/**
 * Checks if ET time is within market hours (9:30 AM - 4:00 PM ET, Mon-Fri).
 */
export function isMarketOpen(date = new Date()): boolean {
  const dayOfWeek = date.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
  })

  // Weekend check
  if (dayOfWeek === 'Sat' || dayOfWeek === 'Sun') {
    return false
  }

  const components = getCurrentETComponents(date) // Pass the date!
  const currentMinutes = components.hour * 60 + components.minute

  // Market hours: 9:30 AM - 4:00 PM ET
  const marketOpen = 9 * 60 + 30 // 9:30 AM = 570 minutes
  const marketClose = 16 * 60 // 4:00 PM = 960 minutes

  return currentMinutes >= marketOpen && currentMinutes < marketClose
}

/**
 * Gets market status: "open", "closed", "premarket", "afterhours"
 */
export function getMarketStatus(date = new Date()): 'open' | 'closed' | 'premarket' | 'afterhours' {
  const dayOfWeek = date.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
  })

  // Weekend
  if (dayOfWeek === 'Sat' || dayOfWeek === 'Sun') {
    return 'closed'
  }

  const components = getCurrentETComponents(date) // Pass the date!
  const currentMinutes = components.hour * 60 + components.minute

  const preMarketStart = 4 * 60 // 4:00 AM
  const marketOpen = 9 * 60 + 30 // 9:30 AM
  const marketClose = 16 * 60 // 4:00 PM
  const afterHoursEnd = 20 * 60 // 8:00 PM

  if (currentMinutes >= marketOpen && currentMinutes < marketClose) {
    return 'open'
  } else if (currentMinutes >= preMarketStart && currentMinutes < marketOpen) {
    return 'premarket'
  } else if (currentMinutes >= marketClose && currentMinutes < afterHoursEnd) {
    return 'afterhours'
  } else {
    return 'closed'
  }
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
  const nowComponents = getCurrentETComponents(new Date())
  const dateComponents = getCurrentETComponents(date)

  return (
    dateComponents.day === nowComponents.day &&
    dateComponents.month === nowComponents.month &&
    dateComponents.year === nowComponents.year
  )
}

/**
 * Checks if a given date is for a past trading day.
 * Returns true if the date is before today, or if it's today but past market close (4:00 PM ET).
 */
export function isPastTradingDay(reportDate: Date): boolean {
  const nowComponents = getCurrentETComponents(new Date())
  const dateComponents = getCurrentETComponents(reportDate)

  // If different day
  if (
    dateComponents.year !== nowComponents.year ||
    dateComponents.month !== nowComponents.month ||
    dateComponents.day !== nowComponents.day
  ) {
    // Check if date is before now
    const nowDate = new Date(nowComponents.year, nowComponents.month - 1, nowComponents.day)
    const checkDate = new Date(dateComponents.year, dateComponents.month - 1, dateComponents.day)
    return checkDate < nowDate
  }

  // Same day - check if we're past market close (4:00 PM ET)
  const currentMinutes = nowComponents.hour * 60 + nowComponents.minute
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
 * Returns the current date if market is open OR if today is a trading day before market close.
 * Otherwise returns the next trading day.
 *
 * Use this to determine which trading day's data to show.
 */
export function getCurrentOrUpcomingTradingDay(date = new Date()): Date {
  const etTime = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = etTime.getDay()

  // If weekend, return next trading day
  if (day === 0 || day === 6) {
    return getNextTradingDay(date)
  }

  // Weekday - check if past market close (4:00 PM ET)
  const currentMinutes = etTime.getHours() * 60 + etTime.getMinutes()
  const marketClose = 16 * 60 // 4:00 PM

  // If past market close, return next trading day
  if (currentMinutes >= marketClose) {
    return getNextTradingDay(date)
  }

  // Market day, before close - return current date
  return date
}

/**
 * Checks if the given date is for the current or next upcoming trading day.
 * Returns false for past trading days and dates too far in the future.
 */
export function isUpcomingOrCurrentTradingDay(date: Date): boolean {
  return !isPastTradingDay(date) && isDuringOrBeforeNextTradingDay(date)
}

/**
 * Gets current time in ET as a readable string.
 * Example: "10:30 AM EST"
 */
export function getCurrentTimeStringET(): string {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

/**
 * Gets current date and time in ET as a full string.
 * Example: "December 4, 2025 at 10:30 AM EST"
 */
export function getCurrentDateTimeStringET(): string {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'long',
    timeStyle: 'long',
  })
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
 * Gets current date formatted for daily report: "Dec. 4th, 2025"
 */
export function getDailyReportDateET(date = new Date()): string {
  const dateStr = date.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  // Convert "Dec 4, 2025" to "Dec. 4th, 2025"
  const parts = dateStr.match(/(\w+) (\d+), (\d+)/)
  if (!parts) return dateStr

  const [, month, day, year] = parts
  const dayNum = parseInt(day)

  // Get ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
  const getOrdinal = (n: number) => {
    const j = n % 10
    const k = n % 100
    if (j === 1 && k !== 11) return 'st'
    if (j === 2 && k !== 12) return 'nd'
    if (j === 3 && k !== 13) return 'rd'
    return 'th'
  }

  return `${month}. ${dayNum}${getOrdinal(dayNum)}, ${year}`
}

/**
 * Validate ticker format: alphanumeric, dashes, dots, max length 10
 */
export function isValidTicker(ticker: string): boolean {
  return /^[A-Za-z0-9.-]{1,10}$/.test(ticker)
}

/**
 * Takes a date at midnight and sets it to the current ET time.
 *
 * @param midnightDate - Date object set to midnight (00:00:00)
 * @returns New Date with that date but current ET time
 */
export function setCurrentUTCTime(midnightDate: Date): Date {
  const utcDate = new Date(midnightDate);
  const now = new Date();
  
  // Combine: date part from input + current UTC time
  return new Date(Date.UTC(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds()
  ));
}

/**
 * Returns the abbreviated time zone (e.g. "EST" or "EDT")
 */
function getTimezoneShortName(date: Date, timeZone: string = 'America/New_York'): string {
  const parts = date.toLocaleString('en-US', { 
    timeZone, 
    timeZoneName: 'short' 
  }).split(' ');
  
  return parts[parts.length - 1]; // Returns "EST" or "EDT"
}


/**
 * Shared stock market utilities for date/time validation.
 */
export const stockMarket = {
  isMarketOpen,
  isPastTradingDay,
  isDuringOrBeforeNextTradingDay,
  isUpcomingOrCurrentTradingDay,
  isValidTicker,
  isTodayET,
  getDateString,
  getNextTradingDay,
  getPrevTradingDay,
  getElapsedTimeSince,
  getCurrentOrUpcomingTradingDay,
  getCurrentDateTimeStringET,
  getCurrentTimeStringET,
  getCurrentETComponents,
  getDailyReportDateET,
  getMarketStatus,
  getTimezoneShortName,
  setCurrentUTCTime,
}
