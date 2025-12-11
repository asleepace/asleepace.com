import { fetchOptions } from '@/lib/server/fetch-options'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async (ctx) => {
  const ticker = ctx.params.ticker

  if (!ticker) throw new Error('Invalid stock ticker!')

  const options = await fetchOptions({ ticker })
  return Response.json(options)
}
