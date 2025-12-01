import type { APIRoute } from 'astro'
import { fetchWallStreetBetsComments } from '@/lib/server/fetch-wsb-comments'
import { downloadToPDF } from '@/lib/server/download-to-pdf'
import { fetchGrokBasic } from '@/lib/server/fetch-grok'

const GROK_TEMPLATE = (params: { limit: number; json: any }) => `
Title: Daily Market Analysis
Date: ${new Date().toISOString()}

Analyze the first ${params.limit} comments from WSB daily discussion. Provide:
1. Macro events summary
2. SPY outlook (green/red prediction)
3. Trending stocks (with sentiment)
4. Possible plays
5. Critical analysis

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

This relates to the U.S. stock market, so please also infer what you know about the market,

time of year, recurring trends, and geopolitical knowledge to infer valuable insights.

Be sure to double check your work and look over everything twice to draw additional conclusions or insights.

Assume a high level of technical trading knowledge, but also don't be afraid to be a WSB bear or bull.

Comments:
${JSON.stringify(params.json, null, 2)}
`

async function handlePDFResponse(content: string) {
  const pdfBuffer = await downloadToPDF(content)
  return new Response(pdfBuffer as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="wsb-${new Date().toISOString().split('T')[0]}.pdf"`,
    },
  })
}

const DEFAULT_LIMIT = 500
const DEFAULT_FORMAT = 'json'

/**
 * GET /api/web-scraper/wsb?type=pdf
 *
 * Takes an optional url param
 */
export const GET: APIRoute = async (ctx) => {
  try {
    const outputType = ctx.url.searchParams.get('type') ?? DEFAULT_FORMAT
    const limit = Number(ctx.url.searchParams.get('limit') ?? DEFAULT_LIMIT)

    const { json, html } = await fetchWallStreetBetsComments({ limit })
    const summary = await fetchGrokBasic({ prompt: GROK_TEMPLATE({ limit, json }) })

    switch (outputType) {
      case 'html':
        return new Response(html)
      case 'pdf':
        return handlePDFResponse(summary)
      case 'json':
      default:
        return Response.json({ summary, limit, comments: json })
    }
  } catch (error) {
    const e = error instanceof Error ? error : new Error(String(error))
    console.error('[api/wsb] error:', error)
    return Response.json({ error: e.message })
  }
}
