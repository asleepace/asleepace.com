import type { APIRoute } from 'astro'

import { actions } from 'astro:actions'

export const POST: APIRoute = async (ctx) => {
  console.log(ctx.request.headers)

  const xPageMetrics = ctx.request.headers.get('x-page-metrics')
  if (!xPageMetrics) throw new Error(`Missing header x-page-metrics: "${xPageMetrics}"`)

  const route = new URL(xPageMetrics).pathname

  if (!route) throw new Error(`Missing route for page metrics: "${route}"`)

  const { data: metrics, error } = await ctx.callAction(actions.onPageView, {
    route,
  })

  if (error) throw error
  if (!metrics) throw new Error(`Missing metrics for route: "${route}"`)

  return Response.json(metrics)
}
