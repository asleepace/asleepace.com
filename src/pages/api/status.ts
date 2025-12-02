import { db } from '@/lib/db'
import type { APIRoute } from 'astro'

/**
 * GET /api/status
 *
 * This endpoint returns the status of our services.
 */
export const GET: APIRoute = async () => {
  const postgres = await db.checkIfConnected()
  const services = {
    postgres,
  }

  // quick check how many services are online
  const allServices = Object.values(services)
  const totalOnline = allServices.filter(Boolean).length
  const status = totalOnline === allServices.length ? 'online' : totalOnline === 0 ? 'offline' : 'degraded'

  return Response.json({
    status,
    timestamp: new Date().toISOString(),
    services,
  })
}
