import type { APIRoute } from 'astro'

import { Metrics } from '@/db'

// --- helpers ---

function isValidPath(path: string) {
  return path && typeof path === 'string' && path.startsWith('/')
}

function MetricResponse(path: string) {
  const metrics = Metrics.getPageMetrics(path)
  return Response.json(metrics)
}

function ErrorResponse(message: string) {
  return Response.json({ error: message }, { status: 400 })
}

// --- routes ---

/**
 *  Returns the metrics for a given path as a JSON object.
 */
export const GET: APIRoute = async (ctx) => {
  const path = ctx.request.referrer ?? ctx.originPathname
  if (!isValidPath(path)) return ErrorResponse('Invalid path')
  Metrics.incrementPageViews(path)
  return MetricResponse(path)
}

/**
 *  Increments the likes for a given path.
 */
export const PUT: APIRoute = async (ctx) => {
  const path = ctx.request.referrer ?? ctx.originPathname
  if (!isValidPath(path)) return ErrorResponse('Invalid path')
  Metrics.incrementPageLikes(path)
  return MetricResponse(path)
}

/**
 *  Decrements the likes for a given path.
 */
export const DELETE: APIRoute = async (ctx) => {
  const path = ctx.request.referrer ?? ctx.originPathname
  if (!isValidPath(path)) return ErrorResponse('Invalid path')
  Metrics.decrementPageLikes(path)
  return MetricResponse(path)
}
