import type { APIRoute } from 'astro'
import { endpoint } from '../'
import { http } from '@/lib/web'
import { getProcessInfo } from '@/lib/linux/getProcessInfo'

export const prerender = false

/**
 * GET /api/system/info
 *
 * run the `ps aux` command and return the output as a JSON object
 *
 * @note must be authorized!
 *
 */
export const GET: APIRoute = endpoint(async ({ locals }) => {
  if (!locals.isLoggedIn) return http.failure(401, 'Unauthorized')

  const rows = await getProcessInfo()

  return http.success(rows)
})
