import { fetchGrokBasic } from './fetch-grok'
import { z } from 'zod'

const PROMPT_CALENDAR = (params: { html: string; date?: string }) =>
  `
You are an expert financial analyst. Extract and summarize ONLY the economic calendar and current market data from the provided Yahoo Finance HTML.

STRICTLY follow this JSON schema — no extra fields, no deviations, no explanations outside the JSON:

{
  "title": string,                     // e.g. "Global Economic Calendar - December 2, 2025"
  "date": string,                      // Date string for the calendar
  "events": Array<                     // Only include events from the current or upcoming day
    {
      "name": string,                  // Full event name
      "date": "YYYY-MM-DD",            // Event date
      "score": number,                 // Importance 0-10 (10 = FOMC, NFP, CPI; 7-8 = PMI, Retail Sales; ≤5 = minor)
      "info"?: string                  // Optional short context: time, country, forecast vs previous if meaningful
    }
  >,
  "sentiment": "bearish" | "neutral" | "bullish",   // Overall market tone implied by the week's events
  "notes": Array<string>,              // Array of Bullet-point observations strings (max 4)
  "analysis": string,                  // 2-4 sentence big-picture interpretation
  "indexes": Array<{                   // Major US indexes — extract current values if visible in page
    "name": "S&P 500" | "Dow Jones" | "Nasdaq" | "Russell 2000" | etc.,
    "price": number,
    "change": number,                 // Absolute change (e.g. +12.34 or -56.78)
    "info"?: string                   // Optional: "% change" like "+0.34%"
  }>,
  "commodities": Array<{              // Oil, Gold, Nat Gas, etc.
    "name": string,
    "price": number,
    "change": number,
    "info"?: string
  }>,
  "globalIndices": Array<{           // FTSE, DAX, Nikkei, Hang Seng, etc.
    "name": string,
    "price": number,
    "change": number,
    "info"?: string
  }>,
  "otherAssets"?: Array<{           // Crypto, bonds, VIX, etc. — only if clearly shown
    "name": string,
    "price": number,
    "change": number,
    "info"?: string
  }>
}

=== SCORING GUIDELINES (follow exactly) ===
10: Fed decisions, Nonfarm Payrolls, CPI/PPI, GDP
8-9: Major PMI, Retail Sales, Unemployment Claims, Rate decisions (ECB/BOE)
6-7: Durable Goods, Housing data, Consumer Confidence
≤5: Everything else

=== INSTRUCTIONS ===
- Today is ${params.date || new Date().toISOString().split('T')[0]}. Focus on events for today and the rest of the week.
- If actual values exist → mention surprise/miss in "info". If not → note forecast vs previous when relevant.
- For sentiment: hawkish/surprise beats → bullish, dovish/misses → bearish.
- Always try to extract current prices for major indexes, commodities, and global indices from the page (they appear in sidebars/market summary).
- If no price data is found → use empty arrays [] for that section (never null or fake data).
- Respond with ONLY valid JSON. No markdown, no code blocks, no trailing text.

HTML FOLLOWS BELOW:
${params.html}
`.trim()

export const CalendarSchema = z
  .object({
    title: z.string().default('Calendar Summary'),
    date: z.coerce.date(),
    sentiment: z.string().optional(),
    events: z.array(z.record(z.string(), z.any())),
    notes: z.array(z.string()).or(z.string()).default([]),
    analysis: z.string().optional(),
  })
  .passthrough()

export type CalendarSummary = z.infer<typeof CalendarSchema>

/**
 * ## Fetch Yahoo Calendar
 *
 * This endpoint fetchs the raw HTML from the Yahoo calendar and removes some fluff
 * and returns as a string.
 *
 * @note this does not perform analysis.
 */
export async function fetchYahooCalendar({ date = new Date() }: { date?: Date }): Promise<string> {
  const dateParam = date.toISOString().split('T')[0]

  const url = `https://finance.yahoo.com/calendar/earnings?day=${dateParam}`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  })

  let html = await response.text()

  // Match only the body
  const bodyMatch = html.match(/<body[\s\S]*?<\/body>/i)
  html = bodyMatch ? bodyMatch[0] : html

  // Remove scripts, styles, comments, SVGs
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  html = html.replace(/<!--[\s\S]*?-->/g, '')
  html = html.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')

  // Remove common noise
  html = html.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, '')
  html = html.replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, '')
  html = html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, '')
  html = html.replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, '')

  // Remove noisy attributes (optional - saves more tokens)
  html = html.replace(/\s(data-ylk|aria-label|aria-hidden|fetchpriority|loading|srcset|sizes)="[^"]*"/gi, '')

  // Remove extra whitespace and newlines
  html = html.replace(/\s+/g, ' ')
  html = html.replace(/>\s+</g, '><')
  html = html.trim()

  return html
}

/**
 * ## Fetch Yahoo Calendar
 *
 * Fetches the yahoo calendar for the specified date and then performs
 * an AI analysis with Grok into structured data.
 *
 * @param {Date} date - optional date to check.
 */
export async function fetchCalendarAnalysis({ date = new Date() }: { date?: Date }): Promise<CalendarSummary> {
  const dateParam = date.toISOString().split('T')[0]

  // Format: YYYY-MM-DD
  const url = `https://finance.yahoo.com/calendar/earnings?day=${dateParam}`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  })

  const html = await response.text()

  const calendarSummaryJson = await fetchGrokBasic({
    prompt: PROMPT_CALENDAR({ html, date: dateParam }),
    model: 'grok-4-fast-non-reasoning',
    temperature: 0.0,
  })

  return CalendarSchema.parse(JSON.parse(calendarSummaryJson))
}
