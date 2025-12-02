import { db } from '@/lib/db'
import type { APIRoute } from 'astro'

/**
 * GET /api/status
 *
 * This endpoint returns the status of our services.
 */
export const GET: APIRoute = async () => {
  return Response.json({
    status: 'online',
    services: {
      postgres: await db.checkIfConnected(),
    },
  })
}
