import { fetchGrokBasic } from '@/lib/server/fetch-grok'
import { parseJsonSafe } from '@/lib/utils/safe-json'
import YahooFinance from 'yahoo-finance2'
import { z } from 'zod'

const SPYOptionAnalysisSchema = z.object({
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

export type SPYOptionsAnalysis = z.infer<typeof SPYOptionAnalysisSchema>

/**
 * Fetch an ai analysis of the SPY options chain.
 */
export async function fetchSpyOptions(): Promise<SPYOptionsAnalysis | undefined> {
  try {
    const yahoo = new YahooFinance({ suppressNotices: ['yahooSurvey'] })
    const spyOptions = await yahoo.options('SPY')

    console.log({ spyOptions })

    const outputText = await fetchGrokBasic({
      prompt: `
You are an experience options trader who trades daily and weekly spy options. Analyze the current SPY options
chain and determine the following:

Metadata
 CURRENT_DATE=${new Date()}
 TICKER=SPY

Goals
- Calls vs. Puts ratio
- Where the bulls are targeting
- Where the bears are targeting
- Unusual options activity
- Extrapolate behavior based on analysis
- Identify the best options play for $200

Formatting
  our output should be a JSON object containing the following:

{
  "date": "12-10-2025",       // Format as "MM-DD-YYYY"
  "targetBearStrike": 685,    // Format as number
  "targetBullStrike": 675,    // Format as number
  "notes": [                  // Array<string> containing short concise notes
      "low volume of puts on monday",
      "wide spread between call buys and sellers on ATM calls",
      "large spike of call options on Thursday",
  ],
  "analysis": "The options chain shows...", // string: a short paragraph summary of your findings
  "bestPlays: ['SPY $670c 12-15-25', 'PUT 12-10-25'], // Array<string> containing 4 best options plays
  "pick: "SPY $670c 12-15-25",  // string containing favorite options play
  "averageVolume": 0.5          // rough estimate from 0.0 to 2.0 which represents % of average volume
  "sentiment": "bullish"        // single word to describe market based on options analysis
}

-------------------------------------------------------------
  ${JSON.stringify(spyOptions, null, 2)}
-------------------------------------------------------------
      `.trim(),
      temperature: 0,
    })
    const [safeJson, err] = parseJsonSafe<any>(outputText)

    if (err) {
      return undefined
    }

    console.log('[fetch-spy-options] data:', safeJson)
    return SPYOptionAnalysisSchema.parse(safeJson)
  } catch (e) {
    console.warn('[fetch-spy-options] failed:', e)
    return undefined
  }
}
