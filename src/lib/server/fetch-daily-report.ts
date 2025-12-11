import { getDailyReport, updateDailyReport, type DailyReport, createDailyReport } from '@/lib/db/daily-reports'
import { fetchGrokBasic } from './fetch-grok'
import { fetchWallStreetBetsComments, type WallStreetBetsComment } from './fetch-wsb-comments'
import { fetchYahooCalendar } from './fetch-yahoo-calendar'
import YahooFinance from 'yahoo-finance2'
import { stockMarket } from '@/lib/utils/stock-market'
import { fetchReportCard } from './fetch-report-card'
import { bulkUpsertComments } from '@/lib/db/daily-wsb-comments'
import { fetchSpyOptions, type SPYOptionsAnalysis } from './fetch-spy-options'

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

const DEFAULT_LIMIT = 300

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
  marketStatus: string
  marketTime: string
  spy: Record<string, any> | undefined | null
  btc: Record<string, any> | undefined | null
  openReportText: string | undefined
  spyOptions: SPYOptionsAnalysis | undefined
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
- Do Not say market closed if market status is "open"
- Assume MARKET_STATUS and MARKET_TIME are the current time
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
  CURRENT_TIME: ${params.marketStatus}
  MARKET_STATUS: ${params.marketStatus}
  SPY_DATA: ${JSON.stringify(params.spy, null, 2)}
  BTC_DATA: ${JSON.stringify(params.btc, null, 2)}
  SPY_OPTIONS: ${JSON.stringify({ analysis: params.spyOptions }, null, 2)}
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
    The Date/Time should be a rough estimate (MAX 6 ENTRIES - Most important). Add "⋆" after event name for pivotal events like FOMC, NVIDIA Earnings, macro movers, etc.

    Example table:
      | Event Name | Date / Time | Summary        |
      | ---------- | ----------- | -------------- |
      | [CRWD](#crwd) Earnings | Today    | Q3 exp 0.94 EPS; cybersecurity beat potential |
      | [MRVL](#mrvl) Earnings | Today    | Q3 exp 0.74 EPS; AI M&A buzz |
      | [AEO](#aeo) Earnings  | Today    | Q3 exp 0.46 EPS; holiday retail gauge |
      | PPI Release   | Tomorrow | Inflation check; core >2.5% risks hawkish Fed |
      | FOMC Meeting ⋆| Next Week | Rate hold expected; dovish dots bullish |
      | [Full Calendar](https://finance.yahoo.com/calendar/economic/) | | View all events |

  ### Playbook

    Provide a short paragraph summary of the macro play and what you like.
    Provide a bulleted list of possible plays you like and why
    Provide a YOLO play (1-2 sentences.)

  ### SPY Options

    Provide a short paragraph summary of the SPY options chain analysis
    Provide a bulleted list of bullish play, bearish play, personal favorite
    Provide a short paragraph analysis of SPY options data, and infer related insights to events & sentiment.

  ### Bulls vs. Bears

    Provide a simple table predicting SPY's closing price today for both bulls and bears
    based on market sentiment, current levels, realistic outcomes, upcoming events, etc.
    Keep moves reasonable for daily action (0-5% max). Replace "%%%" with  sentiment analysis (e.g. 68%). Current SPY: ${
      params.spy?.price || 'N/A'
    }

    Example Table: (e.g. generate this table with estimated closing price of SPY:
      | <span class="table-header-centered">Bull SPY Predictions (%%%)</span> | <span class="table-header-centered">Bear SPY Predictions (%%%)</span> |
      | ------------------------------ | ------------------------ |
      | <span class="bull">$700</span> | <span class="bear">$600</span> |
    )

    **Bull Thesis**: Provide 3-4 sentences for the bull thesis (%%%)

    **Bear Thesis**: Provide 3-4 sentences for the bear thesis (%%%)

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

    Provide a brief summary of the most important aspects of the day, keep this as plain english, full text
    sentance focused on sentiment, macro catalysts, what to expect in the week ahead, and your overall take
    on market conditions. Output should not contain price info, symbols, emojis, and should break it down
    so anyone can understand.

    <div class="revisions-table-wrapper">
      (optional) Provide a table of market analysis revisions over time from revision data below,
      Example table:
        | Revisions       | Time        |
        | --------------- | ----------- |
        | e.g. BTC revised to +7% surge vs prior reject | 10:00am |
        | e.g. Sentiment +3% bull on filtered calls print | 2:00am |
        | e.g. Plays add DLTR; targets from $682 base | 5:00pm |
        | e.g. Momentum sours on tariff rumors | 7:00pm |
    </div>

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
}): Promise<Pick<DailyReport, 'market_date' | 'summary' | 'initial' | 'data'>> {
  const timer = createTimer()
  console.log(`[fetch-daily-report] (${timer.elapsed}s) fetching daily report...`)

  // Extract previous report data
  const openReportText = prevReport?.summary
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
  const combinedComments = [...comments, ...(prevComments ?? [])].filter((comment) => comment && comment?.id)
  combinedComments.forEach((comment) => comment?.id && uniqueComments.set(comment.id, comment))
  const allComments = Array.from(uniqueComments.values())

  console.log(`[fetch-daily-report] (${timer.elapsed}s) processing ${allComments.length} comments`)

  // Persist WSB Comments to table:
  bulkUpsertComments(
    allComments.map((comment) => {
      return {
        market_date: date,
        parent_id: null,
        ...comment,
        timestamp: new Date(comment.timestamp),
      }
    })
  ).catch((err) => {
    console.warn('[fetch-daily-report] failed to upsert comments:', err)
  })

  // convert mindnight UTC date string to date with current ET time
  const etDate = stockMarket.setCurrentUTCTime(new Date(date))
  const marketStatus = stockMarket.getMarketStatus(etDate)
  const etTime = etDate.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    timeStyle: 'full',
  })

  // const timezone = stockMarket.getTimezoneShortName(etDate)

  const spyOptions = await fetchSpyOptions()

  // Generate report with Grok
  const nextReportText = await fetchGrokBasic({
    model: 'grok-4-1-fast',
    prompt: GROK_TEMPLATE({
      date,
      spyOptions,
      spy: spyData,
      btc: btcData,
      limit,
      comments: allComments,
      calendar: calendarHtml,
      marketStatus,
      marketTime: etTime,
      openReportText,
      revisions: prevReport?.data?.revisions ?? [],
      links: [
        { name: 'Prev Report', href: `/daily-report` },
        { name: 'Next Report', href: `/daily-report` },
      ],
    }),
  })

  console.log(`[fetch-daily-report] (${timer.elapsed}s) report generated`)

  const reportCard = await fetchReportCard({
    date,
    dailyReportText: nextReportText,
    meta: {
      spyData,
    },
  })

  return {
    market_date: date,
    summary: nextReportText,
    initial: prevReport?.summary ?? '',
    data: {
      model: 'grok-4-1-fast',
      // NOTE: Keep the initial report for comparison.
      openReportText: prevReport?.data?.openReportText ?? nextReportText,
      comments: allComments.map((item) => item.id),
      calendar: calendarHtml,
      spy: spyData,
      btc: btcData,
      revisions: prevRevisions,
      generationTime: timer.elapsed,
      timestamp: new Date().toISOString(),
      reportCard,
    },
  }
}

export type FetchDailyReportOptions = {
  date?: Date
  limit?: number
  refresh?: boolean
  hardRefresh?: boolean
}

let isFetchingRevisions = false

/**
 * Handle parsing revisions between report generations in the background as it can
 * take a while to parse.
 *
 * @note this function does not throw.
 */
async function handleRevisionsInBackground(report: DailyReport) {
  if (isFetchingRevisions) return
  isFetchingRevisions = true
  // get initial report generation text which is saved in data object
  const openReportText = report.data?.openReportText
  const prevRevisions: string[] = report.data?.revisions ?? []
  const shortDate = stockMarket.getDateString(report.market_date)
  try {
    if (!openReportText) throw 'ERR_MISSING_OPEN_REPORT_TEXT'

    // Generate revision notes if previous report exists
    const revisionText = await fetchGrokBasic({
      model: 'grok-4-1-fast-non-reasoning',
      prompt: `Compare these two reports and list 3-5 key changes as concise bullet points:
        INITIAL:
          ${report.initial}...

        CURRENT:
          ${report.summary}...

        Output only bullet points of meaningful changes (sentiment shifts, new data, revised outlooks).`,
    })

    // process results as timestamped strings
    const newRevisions = revisionText
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => `[${new Date().toISOString()}] ${line}`)

    // merge with previous revisions
    const allRevisions = [...prevRevisions, ...newRevisions]

    // persist change to database
    await updateDailyReport(report.id!, {
      data: {
        ...report.data,
        revisions: allRevisions,
      },
    })
  } catch (e) {
    console.warn(`[fetch-daily-report] background revisions job failed for "${shortDate}"`, e)
  } finally {
    console.log(`[fetch-daily-report] background revisions job finished for "${shortDate}".`)
    isFetchingRevisions = false
  }
}

/**
 * ## Get or Create Daily Report
 *
 * Get current daily report in databaes or attempt to generate and persist if within
 * valid T+0 or T+1 date range.
 */
export async function getOrCreateDailyReport({ date }: { date: Date }): Promise<DailyReport> {
  const persistedReport = await getDailyReport({ date })
  if (persistedReport) return persistedReport
  if (!stockMarket.isUpcomingOrCurrentTradingDay(date)) {
    const info = stockMarket.getDateString(date)
    throw new Error(`Invalid date range for daily report "${info}" (must be T+0 or T+1)`)
  }
  console.log('[fetch-daily-report] generating new report...')
  const dailyReport = await handleReportGeneration({ date, limit: DEFAULT_LIMIT, prevReport: undefined })
  const savedReport = await createDailyReport(dailyReport)
  return savedReport
}

/**
 * Fetch Daily Report
 *
 * Fetches comments from Wall Street Bets and performs analysis with Grok.
 * Results are cached in PostgreSQL by date.
 *
 * @note does not automatically refresh unless specified.
 *
 * @param options.date - Target date for report (defaults to today)
 * @param options.limit - Max WSB comments to fetch (default: 250)
 * @param options.refresh - Regenerate even if cached (default: false)
 * @param options.hardRefresh - Regenerate without previous report data (default: false)
 */
export async function fetchDailyReport({
  date = new Date(),
  limit = 300,
  refresh = false,
  hardRefresh = false,
}: FetchDailyReportOptions = {}): Promise<DailyReport> {
  const timer = createTimer()

  // get existing report from database
  const existingReport = await getOrCreateDailyReport({ date })

  // skip regenerating unless a refresh is requested
  if (!refresh && !hardRefresh) return existingReport

  // Generate new report
  const prevReport = hardRefresh ? undefined : existingReport
  const nextReport = await handleReportGeneration({ date, limit, prevReport })

  // Save to database
  const savedReport = await createDailyReport(nextReport)
  console.log(`[fetch-daily-report] (${timer.elapsed}s) report saved!`)

  // Schedule parsing revisions in background
  void handleRevisionsInBackground(savedReport)

  return savedReport
}

/**
 * Simple flag to avoid duplicating refreshes.
 */
let isRefreshing = false

/**
 * Triggers a refresh of the specified daily report if:
 *
 *  1. Not currently refreshing
 *  2. Previous report exists
 *  3. Previous report is for T+0 or T+1 trading days
 *  4. Last refresh was more than 15mins ago
 *
 * @note this function does not throw.
 */
export async function triggerDailyReportRefreshInBackground({ date }: { date: Date }) {
  if (isRefreshing) return // skip if already refreshing...
  isRefreshing = true
  const shortDate = stockMarket.getDateString(date)
  console.log('[fetch-daily-report] scheduling background refresh...')
  try {
    // get current report saved in database
    const existingReport = await getDailyReport({ date })

    // verify a report exists to refresh and is in valid date range
    if (!existingReport) {
      console.log('[fetch-daily-report] generating report for ', date)
      const dailyReport = await handleReportGeneration({ date, limit: DEFAULT_LIMIT, prevReport: undefined })
      await createDailyReport(dailyReport)
      return
    }

    if (!stockMarket.isUpcomingOrCurrentTradingDay(date)) throw new Error('ERR_DAILY_REPORT_RANGE')

    // get last updated or created at time
    const lastGenerationDate = existingReport.updated_at
    if (!lastGenerationDate) throw new Error('ERR_DAILY_REPORT_MISSING_UPDATED_AT')

    // check how much time has elapsed since last generation
    const elapsedTime = stockMarket.getElapsedTimeSince(lastGenerationDate)
    if (elapsedTime.mins <= 15) throw new Error('ERR_DAILY_REPORT_REFRESH_TOO_SOON')

    // handle refreshing report, saving to database & checking revisions
    const dailyReport = await handleReportGeneration({ date, limit: DEFAULT_LIMIT, prevReport: existingReport })
    const savedReport = await createDailyReport(dailyReport)
    await handleRevisionsInBackground(savedReport)

    // log message when finished
    console.log('[fetch-daily-report] background refresh finished!')
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    console.warn(`[fetch-daily-report] skipping background refresh for "${shortDate}":`, err.message)
  } finally {
    isRefreshing = false
  }
}
