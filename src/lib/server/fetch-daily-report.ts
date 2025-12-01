import { fetchGrokBasic } from './fetch-grok'
import { fetchWallStreetBetsComments, type WallStreetBetsComment } from './fetch-wsb-comments'

const GROK_TEMPLATE = (params: { limit: number; comments: WallStreetBetsComment[] }) =>
  `
Title: Daily Market Analysis
Date: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}

Analyze the first ${params.limit} comments from WSB daily discussion. Provide:
1. Macro events summary
2. SPY outlook (green/red prediction)
3. Trending stocks (with sentiment)
4. Possible plays
5. Bull vs. Bear thesis
6. Critical analysis

Guidelines:
- Higher score comments = more reliable
- High reply counts = trending topics
- Filter obvious nonsense/spam
- Terms: "Bol" = bull, "Mango" = Trump, "JPow" = Jerome Powell
- Format tickers as markdown links: [TICKER](/ticker)
- Be concise, draw critical conclusions
- Infer witching days, sentiment, key items to watch
- Don't repeat instructions (unless very good reason to do so)
- Be on alert for any and all macro events (none may exist too)

This relates to the U.S. stock market, so also infer what you know about the market,
time of year, recurring trends, geopolitical knowledge and other misc factors to infer valuable insights.

Be sure to double check your work and look over everything twice to draw additional conclusions or insights.
Assume a high level of technical trading knowledge, but also don't be afraid to be a WSB bear or bull.

Comments:
${JSON.stringify(params.comments, null, 2)}
`.trim()

export type DailyReportOptions = {
  refresh?: boolean
  limit?: number
}

export type DailyReportOutput = {
  comments: WallStreetBetsComment[]
  summary: string
  html: string
}

async function fetchWsbWithGrok({ limit = 250 }: DailyReportOptions): Promise<DailyReportOutput> {
  const { json: comments, html } = await fetchWallStreetBetsComments({ limit })

  const prompt = GROK_TEMPLATE({ limit, comments })
  const summary = await fetchGrokBasic({ prompt })

  return {
    comments,
    summary,
    html,
  }
}

/**
 * ## Fetch Daily Report
 *
 * Fetches comments from the Wall Street Bets discussion thread and performs an analysis
 * with Grok 4 fast non-reasoning.
 *
 * @see https://www.reddit.com/r/wallstreetbets/
 */
export async function fetchDailyReport({ limit = 250, refresh = false }): Promise<DailyReportOutput> {
  const today = new Date().toISOString().split('T')[0]
  const filePath = `public/daily/report-${today}.json`
  const file = Bun.file(filePath, { type: 'application/json' })
  if (refresh === false && (await file.exists())) {
    return await file.json()
  }
  const report = await fetchWsbWithGrok({ limit })
  await file.write(JSON.stringify({ ...report, limit }, null, 2))
  return report
}
