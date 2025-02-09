import { http } from '@/lib/web'
import type { APIRoute } from 'astro'

export const prerender = false

const HOME = String(process.env.HOME)
const WHOAMI = String(process.env.USER)
const PWD = String(process.env.PWD).replace(HOME, '~')

export const POST: APIRoute = async ({ request }) => {
  const text = await request.text()

  if (!text) return http.failure(400, 'No command provided')
  if (typeof text !== 'string') return http.failure(400, 'Invalid command')

  const cmds = text.trim().split(' ')

  if (cmds.length === 0) return http.failure(400, 'No command provided')

  const process = Bun.spawn({
    cmd: [...cmds],
    stdout: 'pipe',
  })

  const output = await new Response(process.stdout).text()

  return http.success({
    command: cmds,
    whoami: WHOAMI,
    pwd: PWD,
    output,
  })
}
