import { createEventStream } from '@/lib/stream/createEventStream'
import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async ({ request }) => {
  return createEventStream({ request })
}
