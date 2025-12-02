import { fetchGrokBasic } from './fetch-grok'
import { fetchPuppet } from './fetch-puppet'
import { z } from 'zod'

// Importance score: 0 to 10 inclusive
const ScoreSchema = z.number().int().min(0).max(10) as z.ZodType<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>

const EconomicEventSchema = z
  .object({
    name: z.string().min(1, 'Event name is required'),
    date: z.coerce.date(),
    score: ScoreSchema,
    info: z.string().optional(),
  })
  .passthrough()

const AssetSchema = z
  .object({
    name: z.string().min(1),
    price: z.number().nullable(),
    change: z.number().nullable(),
    info: z.string().optional(),
  })
  .passthrough()

const EconomicResponseSchema = z
  .object({
    title: z.string().default('Yahoo Calendar'),
    date: z.coerce.date(),
    events: z.array(EconomicEventSchema),
    sentiment: z.enum(['bearish', 'neutral', 'bullish']),
    notes: z.array(z.string()),
    analysis: z.string(),
    indexes: z.array(AssetSchema),
    commodities: z.array(AssetSchema),
    globalIndices: z.array(AssetSchema),
    otherAssets: z.array(AssetSchema).optional(),
  })
  .passthrough()

// Optional: Create a type for TypeScript usage
export type EconomicResponse = z.infer<typeof EconomicResponseSchema>

const YAHOO_HEADERS = Object.fromEntries(
  [
    'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language: en-US,en;q=0.9,da;q=0.8',
    'priority: u=0, i',
    'sec-ch-ua: "Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
    'sec-ch-ua-mobile: ?0',
    'sec-ch-ua-platform: "macOS"',
    'sec-fetch-dest: document',
    'sec-fetch-mode: navigate',
    'sec-fetch-site: none',
    'sec-fetch-user: ?1',
    'upgrade-insecure-requests: 1',
    'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  ].map((item) => item.split(': ') as [string, string])
)

/**
 * ## fetchCalendar()
 *
 */
export async function fetchCalendar() {
  const { page, browser } = await fetchPuppet({ headers: YAHOO_HEADERS })
  try {
    await page.goto('https://finance.yahoo.com/calendar/economic/', { timeout: 60_000 })
    console.log('[fetch-calendar] navigated to page!')
    const mainContent = await page.evaluate(() => {
      return document.querySelector('main')?.outerHTML
    })

    if (!mainContent) {
      throw new Error('Failed to find content on Yahoo Calendar.')
    }
    console.log('[fetch-calendar] loaded main content, processing with ai...')
    const summary = await fetchGrokBasic({
      prompt: `
  You are an expert financial analyst. Extract and summarize ONLY the economic calendar and current market data from the provided Yahoo Finance HTML.
  
  STRICTLY follow this JSON schema — no extra fields, no deviations, no explanations outside the JSON:
  
  {
    "title": string,                     // e.g. "Global Economic Calendar - December 2, 2025"
    "date": "YYYY-MM-DD",                // the main date this calendar refers to (usually today or tomorrow)
    "events": Array<                     // Only include events from the current or upcoming day
      {
        "name": string,                  // Full event name
        "date": "YYYY-MM-DD",            // Event date
        "score": number,                 // Importance 0-10 (10 = FOMC, NFP, CPI; 7-8 = PMI, Retail Sales; ≤5 = minor)
        "info"?: string                  // Optional short context: time, country, forecast vs previous if meaningful
      }
    >,
    "sentiment": "bearish" | "neutral" | "bullish",   // Overall market tone implied by the week's events
    "notes": string[],                   // Bullet-point observations (max 4)
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
  - Today is ${new Date().toISOString().split('T')[0]}. Focus on events for today and the rest of the week.
  - If actual values exist → mention surprise/miss in "info". If not → note forecast vs previous when relevant.
  - For sentiment: hawkish/surprise beats → bullish, dovish/misses → bearish.
  - Always try to extract current prices for major indexes, commodities, and global indices from the page (they appear in sidebars/market summary).
  - If no price data is found → use empty arrays [] for that section (never null or fake data).
  - Respond with ONLY valid JSON. No markdown, no code blocks, no trailing text.
  
  HTML FOLLOWS BELOW:
  ${mainContent}
  `.trim(),
    })
    console.log('[fetch-calendar] parsing response ...')
    const jsonSummary = JSON.parse(summary)
    return EconomicResponseSchema.parse(jsonSummary)
  } catch (e) {
    console.warn('[fetch-calendar] failed:', e)
    if (e instanceof Error) throw e
    throw new Error(String(e))
  } finally {
    await browser.close()
  }
}
