import type { APIRoute } from 'astro'

import { fetchSpyOptions } from '@/lib/server/fetch-spy-options'

export const GET: APIRoute = async () => {
  const analysis = await fetchSpyOptions()
  console.log({ analysis })
  return Response.json({ analysis })
}
