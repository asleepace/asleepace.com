import { sleep } from '@/lib/utils/sleep'

export type EventStreamInit = {
  request: Request
  /** @default 1000 ms between stream writes */
  interval?: number
  /** headers to add to the response */
  headers?: Record<string, string>
}

/**
 * ## createEventStream(request)
 *
 * This method creates a ReadableStream instance and returns it as an HTTP
 * response, which can be consumed by an EventSource.
 *
 * NOTE: in dev this won't call cancel or be aborted!
 *
 * issue: https://github.com/withastro/astro/issues/9068
 */
export function createEventStream({
  request,
  interval = 1000,
  headers = {},
}: EventStreamInit) {
  const streamId = crypto.randomUUID()

  let isConnected = false
  let count = 0

  const stream = new ReadableStream({
    async start(controller) {
      console.log(`[${streamId}] starting!`)
      isConnected = true
      request.signal.onabort = () => {
        console.log(`[${streamId}] aborting (onabort)!`)
        isConnected = false
        controller.close()
        stream.cancel()
      }
    },
    async pull(controller) {
      if (request.signal.aborted || !isConnected) {
        console.log(`[${streamId}] aborting!`)
        controller.close()
        stream.cancel()
        return
      }

      controller.enqueue(`data: ${count++}\n\n`)
      await sleep(interval)
    },
    cancel() {
      console.log(`[${streamId}] canceling!`)
      isConnected = false
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...headers,
    },
  })
}
