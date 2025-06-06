import type { APIRoute } from 'astro'
import { Try } from '@asleepace/try'

export const prerender = false

interface Notification {
  type: 'deploy'
  message: string
}

interface DeployNotification extends Notification {
  type: 'deploy'
  message: string
  commit: string
}

const INVALID_BODY = JSON.stringify({
  error: 'invalid_body',
  message: 'request body must be valid json.',
  ok: false,
})

const SUCESS_BODY = JSON.stringify({
  ok: true,
})

const isNotification = (data: unknown): data is Notification => {
  return Boolean(data && typeof data === 'object' && 'type' in data)
}

export const POST: APIRoute = async ({ request }) => {
  const payload = await Try.catch(() => request.json())

  if (payload.isErr()) {
    return new Response(INVALID_BODY, {
      statusText: 'Missing or invalid body',
      status: 500,
    })
  }

  const data = payload.unwrap()

  if (!isNotification(data)) {
    return new Response(INVALID_BODY, {
      statusText: 'Invalid notification type',
      status: 500,
    })
  }

  // broadcast notification here...

  console.log('[notify] incoming notification:', data)
  return new Response(SUCESS_BODY)
}
