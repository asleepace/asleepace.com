import {
  getAdjacentReports,
  getDailyReport,
  updateDailyReport,
  upsertDailyReport,
  type DailyReport,
} from '../db/daily-reports'
import { fetchGrokBasic } from './fetch-grok'
import { fetchWallStreetBetsComments, type WallStreetBetsComment } from './fetch-wsb-comments'
import { fetchYahooCalendar } from './fetch-yahoo-calendar'
import YahooFinance from 'yahoo-finance2'

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

/**
 * Get the previous date (day before)
 */
export function getPreviousDate(date: Date | string): Date {
  const current = typeof date === 'string' ? new Date(date) : new Date(date)
  const previous = new Date(current)
  previous.setDate(previous.getDate() - 1)
  return previous
}

/**
 * Get the next date (day after)
 */
export function getNextDate(date: Date | string): Date {
  const current = typeof date === 'string' ? new Date(date) : new Date(date)
  const next = new Date(current)
  next.setDate(next.getDate() + 1)
  return next
}

const GROK_TEMPLATE = (params: {
  date: Date | string
  limit: number
  spy: Record<string, any> | undefined | null
  btc: Record<string, any> | undefined | null
  openReportText: string | undefined
  revisions: string[]
  comments: WallStreetBetsComment[]
  calendar: string | undefined
  links: { name: string; href: string }[]
}) =>
  `
Goal: you are an experienced stock/options trader, experienced in the ways of wallstreetbets, providing a daily analysis
of market trends, sentiment, upcoming events, catalysts, and how they all fit together. This relates to the U.S. stock market, 
so also infer what you know about the market, time of year, recurring trends, geopolitical knowledge and other misc factors 
to infer valuable insights.

Guidelines:
- Focus on big picture
- Focus on short term price action (daily / weekly)
- Do Not Use Emojis
- Do Not Repeat Instructions
- Do Not Use em-dashes for sentences
- Do Not repeat limits (e.g. 180 chars, 300 comments, etc.)
- Higher score comments = more reliable
- High reply counts = trending topics
- Items prefixed with (optional) can be omitted - use best judgement
- Filter obvious nonsense/spam
- Translate WSB Terms to Plain English: "Bol" = bull, "Mango" = Trump, "JPow" = Jerome Powell, "Corn" = "Bitcoin"
- Format tickers as markdown links: [TICKER](#ticker)
- Newer comments and analysis should superced PREVIOUS_ANALYSIS
- If previous analysis is included use new data to revise, update and expand
- If a price is above $1,000 write as $1k, $1.5K, etc.
- If a price is used in a header rounds to nearest dollar
- Infer sentiment, key plays to watch, hidden patterns
- Be on alert for any and all macro events (none may exist too)
- Be smart, clever and think outside the box to gain key insights
- Title should read like a sentence (No punctuation or Emojis)
- Prices should be prefixed with currency symbol
- Tickers should be hyperlinked
- Assume high level of technical knowledge
- Assume high level of options trading
- Double check your work

Sources:
  TARGET_DATE: ${params.date.toString()}
  ${params.openReportText ? `PREVIOUS_ANALYSIS:\n${params.openReportText}` : ''}
  CURRENT_DATE: ${new Date().toISOString()}
  SPY_DATA: ${JSON.stringify(params.spy, null, 2)}
  BTC_DATA: ${JSON.stringify(params.btc, null, 2)}
  COMMENTS_COUNT: ${params.comments.length}
  TOP_COMMENTS: ${JSON.stringify(params.comments.slice(0, 20), null, 2)}
  CALENDAR: ${params.calendar || 'Not available'}

Response Format:
  ### Title (Provide single English headline which is geared towards SEO and marketing, no numbers, no symbols, overview of day.)

  Write a brief synopsis of your analysis, be concise, highlight key sections.

  ### Macro Summary
    Provide 2-3 sentences on SPY outlook for today and this week.
    Provide bullet point list of trending Stocks or Options (2-5 items)
    Provide 2-3 sentences on what to expect in the week ahead (or next week).
    (optional) Provide any other relevant data you think should be included.

  ### Calendar Events

    Provide a short summary of major things to look out for today or this week (2-4 sentences).

    Provide formatted as a table with Event Name, Date / Time (Premarket, Today, 2:00PM EST, Post-market, Tomorrow, Next Week), and Summary (short note on expectations or impact).
    The Date/Time should be a rough estimate (MAX 6 ENTRIES - Most important)

    Example table:
      | Event Name | Date / Time | Summary        |
      | ---------- | ----------- | -------------- |
      | [CRWD](#crwd) Earnings | Today    | Q3 exp 0.94 EPS; cybersecurity beat potential |
      | [MRVL](#mrvl) Earnings | Today    | Q3 exp 0.74 EPS; AI M&A buzz |
      | [AEO](#aeo) Earnings  | Today    | Q3 exp 0.46 EPS; holiday retail gauge |
      | PPI Release   | Tomorrow | Inflation check; core >2.5% risks hawkish Fed |
      | FOMC Meeting  | Next Week | Rate hold expected; dovish dots bullish |
      | [Full Calendar](https://finance.yahoo.com/calendar/economic/) | | View all events |

  ### Playbook

    Provide a short paragraph summary of the macro play and what you like.
    Provide a bulleted list of possible plays you like and why
    Provide a YOLO play (1-2 sentences.)

  ### Bulls vs. Bears

    Provide a simple table predicting SPY's closing price today for both bulls and bears
    based on market sentiment, current levels, realistic outcomes, upcoming events, etc.
    Keep moves reasonable for daily action (0-5% max). Current SPY: ${params.spy?.price || 'N/A'}

    Example Table: (e.g. generate this table with estimated closing price of SPY:
      | <span class="table-header-centered ">Bull SPY Predictions (% sentiment)</span> | <span class="table-header-centered>Bear SPY Predictions (% sentiment)</span> |
      | ------------------------------ | ------------------------ |
      | <span class="bull">$700</span> | <span class="bear">$600</span> |
    )

    **Bull Thesis**: Provide 3-4 sentences for the bull thesis (% sentiment)

    **Bear Thesis**: Provide 3-4 sentences for the bear thesis (% sentiment)

    Provide 2-3 sentences on which direction the overall sentiment is leaning and why.

  ### Unknown Unknowns

    Provide 3-5 sentences on stuff to watch out for when making trades that could directly
    impact your trades.

    Provide bullet points (optional - can be omitted if not needed):
    - (optional) Bulls should watch out for...
    - (optional) Bears should watch out for...
    - (optional) Major macro, global, political, random catalysts
    - (optional) Historical information, trends, patterns
    - (optional) Upcoming holidays, witching days, foreign holidays, etc.
    - (optional) Anything else you think is important

    Provide 2-3 sentences on what to watch for the rest of this week or next week.

  ### Quantitative Analysis

    Provide 1-3 full English paragraphs of your analysis which should include the main factors at play,
    overall market sentiment, where you think the market is heading, and clever innovative insights you,
    include a numbered list of key data points in middle and keep paragraphs more readable, 
    infer from the data and your own best judgment.

  ### Summary

    Provide a short summary of your analysis in 280 Characters or less which can be shared to X
    and uses lamen terms / trendy speak to elegantly paint a picture of the day.

    **Provide a final sentence on who will win and why (bears or bulls) in WSB jargon. (emojis ok)**

    <div class="daily-report-links">
      <a href="/daily-report?date=${getPreviousDate(params.date)}">← Yesterday's report</a>
      <div class="mx-2 w-[0.5px] h-6 bg-neutral-200"></div>
      <a class="text-gray-400!" href="/daily-report?refresh=${+new Date()}">↻ Refresh Report</a>
      <div class="mx-2 w-[0.5px] h-6 bg-neutral-200"></div>
      <a href="/daily-report?date=${getNextDate(params.date)}">Tomorrow's report →</a>
    </div>

    (optional) Provide a table of market analysis revisions over time from revision data below,
    Example table:
      | Revisions       | Time        |
      | --------------- | ----------- |
      | e.g. BTC revised to +7% surge vs prior reject | 10:00am |
      | e.g. Sentiment +3% bull on filtered calls print | 2:00am |
      | e.g. Plays add DLTR; targets from $682 base | 5:00pm |
      | e.g. Momentum sours on tariff rumors | 7:00pm |

    Revision Data:
      {{${params.revisions.join('\n')}}}}

`.trim()

const createTimer = () => {
  const startTime = performance.now()
  return {
    get elapsed() {
      return ((performance.now() - startTime) / 1_000).toFixed(2)
    },
  }
}

async function handleReportGeneration({
  date,
  limit,
  prevReport,
}: {
  date: Date
  limit: number
  prevReport: DailyReport | null | undefined
}): Promise<Pick<DailyReport, 'date' | 'text' | 'data' | 'accuracy'>> {
  const timer = createTimer()
  console.log(`[fetch-daily-report] (${timer.elapsed}s) fetching daily report...`)

  // Extract previous report data
  const openReportText = prevReport?.text
  const prevComments = (prevReport?.data?.comments as WallStreetBetsComment[]) ?? []
  const prevRevisions = (prevReport?.data?.revisions as string[]) ?? []

  // Start parallel fetches
  const [wsbData, calendar, spy, btc] = await Promise.allSettled([
    fetchWallStreetBetsComments({ limit }),
    fetchYahooCalendar({ date }),
    yahooFinance.quoteSummary('SPY'),
    yahooFinance.quoteSummary('BTC-USD'),
  ])

  console.log(`[fetch-daily-report] (${timer.elapsed}s) all data fetched`)

  // Extract results with proper error handling
  const comments = wsbData.status === 'fulfilled' ? wsbData.value.json : []
  const calendarHtml = calendar.status === 'fulfilled' ? calendar.value : undefined
  const spyData = spy.status === 'fulfilled' ? spy.value : undefined
  const btcData = btc.status === 'fulfilled' ? btc.value : undefined

  // Log any failures
  if (wsbData.status === 'rejected') console.warn('[fetch-daily-report] WSB fetch failed:', wsbData.reason)
  if (calendar.status === 'rejected') console.warn('[fetch-daily-report] Calendar fetch failed:', calendar.reason)
  if (spy.status === 'rejected') console.warn('[fetch-daily-report] SPY fetch failed:', spy.reason)
  if (btc.status === 'rejected') console.warn('[fetch-daily-report] BTC fetch failed:', btc.reason)

  // Merge and dedupe comments
  const uniqueComments = new Map<string, WallStreetBetsComment>()
  ;[...comments, ...prevComments].forEach((comment) => uniqueComments.set(comment.id, comment))
  const allComments = Array.from(uniqueComments.values())

  console.log(`[fetch-daily-report] (${timer.elapsed}s) processing ${allComments.length} comments`)

  const links = await getAdjacentReports({ date })

  // Generate report with Grok
  const nextReportText = await fetchGrokBasic({
    model: 'grok-4-1-fast',
    prompt: GROK_TEMPLATE({
      date,
      spy: spyData,
      btc: btcData,
      limit,
      comments: allComments,
      calendar: calendarHtml,
      openReportText,
      revisions: prevReport?.data?.revisions ?? [],
      links: [
        { name: 'Prev Report', href: `/daily-report?date=${links.previous?.date}` },
        { name: 'Next Report', href: `/daily-report?date=${links.next?.date}` },
      ],
    }),
  })

  console.log(`[fetch-daily-report] (${timer.elapsed}s) report generated`)

  return {
    date,
    accuracy: 0,
    text: nextReportText,
    data: {
      model: 'grok-4-1-fast',
      comments: allComments,
      calendar: calendarHtml,
      spy: spyData,
      btc: btcData,
      revisions: prevRevisions,
      generationTime: timer.elapsed,
      timestamp: new Date().toISOString(),
      links,
    },
  }
}

export type FetchDailyReportOptions = {
  date?: Date
  limit?: number
  refresh?: boolean
  hardRefresh?: boolean
}

/**
 * Handle parsing revisions between report generations in the background as it can
 * take a while to parse.
 */
async function handleRevisionsInBackground(nextDailyReport: DailyReport) {
  if (!nextDailyReport.data?.openReportText) return
  if (nextDailyReport.data?.openReportText === nextDailyReport.text) return

  // Generate revision notes if previous report exists
  const prevRevisions = (nextDailyReport.data?.revisions as string[]) ?? []

  const revisionText = await fetchGrokBasic({
    model: 'grok-4-1-fast-non-reasoning',
    prompt: `Compare these two reports and list 3-5 key changes as concise bullet points:

PREVIOUS:
${nextDailyReport.data.openReportText}...

CURRENT:
${nextDailyReport.text}...

Output only bullet points of meaningful changes (sentiment shifts, new data, revised outlooks).`,
  })

  const newRevisions = revisionText
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => `[${new Date().toISOString()}] ${line}`)

  const allRevisions = [...prevRevisions, ...newRevisions]

  await updateDailyReport({
    date: nextDailyReport.date,
    updates: {
      data: {
        ...nextDailyReport.data,
        revisions: allRevisions,
      },
    },
  })
}

/**
 * Fetch Daily Report
 *
 * Fetches comments from Wall Street Bets and performs analysis with Grok.
 * Results are cached in PostgreSQL by date.
 *
 * @param options.date - Target date for report (defaults to today)
 * @param options.limit - Max WSB comments to fetch (default: 250)
 * @param options.refresh - Force regenerate even if cached (default: false)
 */
export async function fetchDailyReport({
  date = new Date(),
  limit = 250,
  refresh = false,
  hardRefresh = false,
}: FetchDailyReportOptions = {}): Promise<DailyReport> {
  const timer = createTimer()

  // Check cache first
  const prevReport = await getDailyReport({ date })

  if (!refresh && prevReport) {
    console.log(`[fetch-daily-report] (${timer.elapsed}s) using cached report`)
    return prevReport
  }

  // Generate new report
  const nextReport = await handleReportGeneration({ date, limit, prevReport: hardRefresh ? undefined : prevReport })

  // Save to database
  const savedReport = await upsertDailyReport(nextReport)

  console.log(`[fetch-daily-report] (${timer.elapsed}s) report saved`)

  // Schedule parsing revisions in background
  void handleRevisionsInBackground(savedReport).catch((err) => {
    console.warn('failed to get revisions:', err)
  })

  return savedReport
}
