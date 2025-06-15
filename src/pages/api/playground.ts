/**
 * This file contains disposable code and is meant as a Playground.
 */

import type { APIRoute } from 'astro'

export const prerender = false

/**
 * Example External Data
 */

// const subscriptions = new Set();

/**
 *  Get a list of new data from last check.
 *
 *  GET /api/playground?id=<identifier>
 */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  console.log('[playground] new incoming url: ', url)
  return Response.json({ ok: true })
}

/**
 *  Create a new trigger subscription.s
 *
 *  POST /api/playground?id=<identifier>
 */
export const POST: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  console.log('[playground] new incoming url: ', url)
  return Response.json({ ok: true })
}

/**
 *  Cancel a current trigger subscription.
 *
 *  DELETE /api/playground?id=<identifier>
 */
export const DELETE: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  console.log('[playground] new incoming url: ', url)
  return Response.json({ ok: true })
}
