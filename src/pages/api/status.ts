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

  const totalServices = Object.keys(services).length
  const totalServicesOnline = Object.values(services).reduce((count, isOnline) => count + (isOnline ? 1 : 0), 0)
  const status = totalServices === totalServicesOnline ? 'online' : totalServicesOnline === 0 ? 'offline' : 'degraded'

  return Response.json({
    status,
    timestamp: new Date(),
    services,
  })
}
