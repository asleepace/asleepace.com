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

async function getOrCreateDailyReport({ limit = 250 }) {
  const today = new Date().toISOString().split('T')[0]
  const filePath = `public/daily/report-${today}.json`
  const file = Bun.file(filePath, { type: 'application/json' })
  if (await file.exists()) {
    return file.json()
  }
  const report = await fetchDailyReport({ limit })
  await file.write(report)
  return report
}

/**
 * GET /api/stocks/daily-report
 *
 * Takes an optional url param
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const DEFAULT_LIMIT = 500
    const DEFAULT_TYPE = 'json'
    const limit = Number(url.searchParams.get('limit') ?? DEFAULT_LIMIT)
    const type = url.searchParams.get('type') ?? DEFAULT_TYPE
    const report = await getOrCreateDailyReport({ limit })

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
