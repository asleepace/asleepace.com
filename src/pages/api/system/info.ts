import type { APIRoute } from 'astro'
import { endpoint } from '../'
import { http } from '@/lib/http'
import { Users, Sessions } from '@/db/index'
import { $ } from 'bun'

export const prerender = false

async function getProcessInfo() {
  console.log('getProcessInfo')
  const proc = Bun.spawn(['ps', 'aux'], {
    stdout: 'pipe',
  })

  const output = await new Response(proc.stdout).text()

  // Parse the output into structured data
  const lines = output.split('\n')
  const headers = lines[0].split(/\s+/)

  return lines
    .slice(1)
    .map((line) => {
      const parts = line.trim().split(/\s+/)
      const result: Record<string, string> = {}

      headers.forEach((header, index) => {
        result[header] = parts[index] || ''
      })

      return result
    })
    .filter((entry) => entry.USER) // Remove empty entries
}

/**
 * GET /api/system/info
 *
 * run the `ps aux` command and return the output as a JSON object
 */
export const GET: APIRoute = endpoint(async ({ request }) => {
  const rows = await getProcessInfo()
  return http.success(rows)
})
