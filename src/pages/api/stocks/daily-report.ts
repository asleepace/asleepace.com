import type { APIRoute } from 'astro'
import { fetchDailyReport } from '@/lib/server/fetch-daily-report'
import { downloadToPDF } from '@/lib/server/download-to-pdf'

async function handlePDFResponse(content: string) {
  const pdfBuffer = await downloadToPDF(content)
  return new Response(pdfBuffer as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="wsb-${new Date().toISOString().split('T')[0]}.pdf"`,
    },
  })
}

/**
 * GET /api/stocks/daily-report
 *
 * Takes an optional url param
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const DEFAULT_LIMIT = 300
    const DEFAULT_TYPE = 'json'
    const limit = Number(url.searchParams.get('limit') ?? DEFAULT_LIMIT)
    const type = url.searchParams.get('type') ?? DEFAULT_TYPE
    const refreshStr = url.searchParams.get('refresh')
    const refresh = refreshStr === 'true' || Number(refreshStr) > 0
    const report = await fetchDailyReport({ limit, refresh })

    switch (type) {
      case 'html':
        return new Response(report.html)
      case 'pdf':
        return handlePDFResponse(report.summary)
      case 'json':
      default:
        return Response.json(report)
    }
  } catch (error) {
    const e = error instanceof Error ? error : new Error(String(error))
    console.error('[api/wsb] error:', error)
    return Response.json({ error: e.message })
  }
}
