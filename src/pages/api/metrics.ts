import type { APIRoute } from 'astro'

import { actions } from 'astro:actions'

export const POST: APIRoute = async (ctx) => {
  const referer = ctx.request.headers.get('referer')

  if (!referer) throw new Error('Missing referer for page metrics!')

  const route = new URL(referer).pathname
  console.log({ route })

  const { data: metrics, error } = await ctx.callAction(actions.onPageView, {
    route,
  })

  if (error) throw error
  if (!metrics) throw new Error('Failed to load metrics for route:' + route)

  const htmlTemplate = `<page-metrics views="${metrics.views}" likes="${metrics.likes}" comments="[]"></page-metrics>`

  return new Response(htmlTemplate, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
