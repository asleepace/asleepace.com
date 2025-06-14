import type { APIRoute } from 'astro'
import { Try } from '@asleepace/try'
import { sendEmailNotification } from '@/lib/mail/sendNotification'

export const prerender = false

const INVALID_BODY = JSON.stringify({
  error: 'invalid_body',
  message: 'request body must be valid json.',
  ok: false,
})

const SUCESS_BODY = JSON.stringify({
  ok: true,
})

const capitalize = (str: string) => {
  if (str.length === 1) return str.toUpperCase()
  return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase()
}

export const GET: APIRoute = async () => {
  return fetch('/api/notify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'deploy',
      subject: 'Testing!',
      message: 'This is a test notification',
    }),
  })
}

/**
 * POST /api/notify
 *
 * This endpoint will dispatch an email notifcation with the given payload.
 *
 */
export const POST: APIRoute = async ({ request }) => {
  const payload = await Try.catch(async () => {
    const json = await request.json().catch(() => request.text())
    return json
  })

  if (payload.isErr()) {
    return new Response(INVALID_BODY, {
      statusText: 'Invalid Body',
      status: 500,
    })
  }

  const data = payload.unwrap() as Record<string, string>
  // broadcast notification here...

  const prefix = capitalize(data?.type ?? 'Asleepace')

  sendEmailNotification({
    subject: `${prefix} Notification`,
    message: data?.message || String(data),
  })

  console.log('[notify] incoming notification:', data)
  return new Response(SUCESS_BODY)
}
