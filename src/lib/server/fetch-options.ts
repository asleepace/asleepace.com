import { fetchGrokBasic } from '@/lib/server/fetch-grok'
import { parseJsonSafe } from '@/lib/utils/safe-json'
import YahooFinance from 'yahoo-finance2'
import type { OptionsResult } from 'yahoo-finance2/modules/options'
import type { QuoteSummaryResult } from 'yahoo-finance2/modules/quoteSummary-iface'
import { z } from 'zod'

const OptionAnalysisSchema = z.object({
  ticker: z.string(),
  date: z.coerce.date(),
  targetBearStrike: z.coerce.number(),
  targetBullStrike: z.coerce.number(),
  notes: z.array(z.string()),
  analysis: z.string(),
  bestPlays: z.array(z.string()),
  pick: z.string(),
  averageVolume: z.number(),
  sentiment: z.string(),
})

export type OptionsAnalysis = z.infer<typeof OptionAnalysisSchema>

export interface StockInfo {
  ticker: string
  summary: QuoteSummaryResult
  options: OptionsResult
  analysis: OptionsAnalysis
}

/**
 * Fetch options chain for specified ticker and perform Ai analysis.
 */
export async function fetchOptions({ ticker = 'SPY' }): Promise<StockInfo> {
  try {
    console.log(`[fetch-options] ticker: ${ticker}`)
    const yahoo = new YahooFinance({ suppressNotices: ['yahooSurvey'] })
    const TICKER = ticker.toUpperCase()
    const summary = await yahoo.quoteSummary(TICKER)
    const options = await yahoo.options(TICKER)
    console.log(`[fetch-options] ${TICKER} options:`, options)

    const outputText = await fetchGrokBasic({
      prompt: `
You are an experience options trader who trades daily and weekly ${TICKER} options. Analyze the current ${TICKER} options
chain and determine the following:

Metadata
 CURRENT_DATE=${new Date()}
 TICKER=${TICKER}

Goals
- Calls vs. Puts ratio
- Where the bulls are targeting
- Where the bears are targeting
- Unusual options activity
- Extrapolate behavior based on analysis
- Identify the best options play for $200

Formatting
  our output should be a JSON object containing the following (repl):

{
  "ticker": "${TICKER}",      // Ticker as string
  "date": "12-10-2025",       // Format as "MM-DD-YYYY"
  "targetBearStrike": 685,    // Format as number
  "targetBullStrike": 675,    // Format as number
  "notes": [                  // Array<string> containing short concise notes
      "low volume of puts on monday",
      "wide spread between call buys and sellers on ATM calls",
      "large spike of call options on Thursday",
  ],
  "analysis": "The options chain shows...", // string: a short paragraph summary of your findings
  "bestPlays: ['${TICKER} $670c 12-15-25', '${TICKER} PUT 12-10-25'], // Array<string> containing 4 best options plays
  "pick: "${TICKER} $670c 12-15-25",  // string containing favorite options play
  "averageVolume": 0.5          // rough estimate from 0.0 to 2.0 which represents % of average volume
  "sentiment": "bullish"        // single word to describe market based on options analysis
}

-------------------------------------------------------------
  ${JSON.stringify(options, null, 2)}
-------------------------------------------------------------
      `.trim(),
      temperature: 0,
    })
    const [safeJson, err] = parseJsonSafe<any>(outputText)
    if (err != null) throw err

    console.log('[fetch-options] data:', safeJson)
    const analysis = OptionAnalysisSchema.parse(safeJson)

    return {
      ticker,
      analysis,
      summary,
      options,
    }
  } catch (e) {
    console.warn('[fetch-options] failed:', e)
    throw e
  }
}
