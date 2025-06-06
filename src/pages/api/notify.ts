import type { APIRoute } from 'astro'
import { Try } from '@asleepace/try'
import { sendEmailNotification } from '@/lib/mail/sendNotification'

export const prerender = false

interface Notification {
  type: 'deploy'
  subject: string
  message: string
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

const capitalize = (str: string) => {
  if (str.length === 1) return str.toUpperCase()
  return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * POST /api/notify
 *
 * This endpoint will dispatch an email notifcation with the given payload.
 *
 */
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

  sendEmailNotification({
    subject: `${capitalize(data.type)} Notification`,
    message: data.message,
  })

  console.log('[notify] incoming notification:', data)
  return new Response(SUCESS_BODY)
}
