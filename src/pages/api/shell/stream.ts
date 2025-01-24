import type { APIRoute } from 'astro'

export const prerender = false

/**
 * ## Shell
 *
 * The shell process that we will be streaming the output of.
 *
 */
const childShellProcess = Bun.spawn(['sh'], {
  stdout: 'pipe',
  stdin: 'pipe',
  stderr: 'pipe',
  // onExit(subprocess, exitCode, signalCode, error) {
  //   console.log(
  //     `[shell/stream] onExit code: ${exitCode} signal: ${signalCode} error: ${error}`
  //   )
  // },
})

/**
 * GET /api/shell/stream
 *
 * Streams the output of the shell.
 *
 */
export const GET: APIRoute = async ({ request }) => {
  // create a new readable stream response
  const stream = new ReadableStream({
    async start(controller) {
      console.log(
        '[shell/stream] starting ReadableStream signal:',
        childShellProcess.signalCode
      )

      // STDOUT: pipe the shell output to the stream as UInt8Array
      // string which will be decoded by the client
      childShellProcess.stdout.pipeTo(
        new WritableStream({
          write(chunk) {
            const bytesString = chunk.toString()
            controller.enqueue(`data: ${bytesString}\n\n`)
          },
        })
      ).catch((err) => {
        console.error('[shell/stream] failed to pipeTo:', err)
      })

      // STDERR: pipe the shell error to the stream
      // childShellProcess.stderr?.pipeTo(
      //   new WritableStream({
      //     write(chunk) {
      //       const data = decoder.decode(chunk, { stream: true })
      //       console.log('[shell/stream] error:', data)
      //       controller.enqueue(`error: ${data}\n\n`)
      //     },
      //   })
      // )
    },
    cancel() {
      console.log('[shell/stream] cancel...')
      console.log('[shell/stream] killing child process!!!!!!!!!!!!!!')
      childShellProcess.kill()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
    status: 200,
  })
}

/**
 * POST /api/shell/stream
 *
 * Sends a command to the shell and streams the output.
 *
 */
export const POST: APIRoute = async ({ request }) => {
  const { command } = await request.json()

  if (!command || typeof command !== 'string') {
    return new Response('Invalid command', { status: 400 })
  }

  if (!childShellProcess) {
    return new Response('Shell not initialized', { status: 500 })
  }

  if (childShellProcess.killed) {
    return new Response('Shell killed', { status: 500 })
  }

  if (!childShellProcess.stdin) {
    return new Response('Shell not initialized', { status: 500 })
  }

  if (typeof childShellProcess.stdin.write !== 'function') {
    return new Response('Shell is not writable', { status: 500 })
  }

  console.log('[shell/stream] writing command:', command)

  // send the command to the shell
  childShellProcess.stdin.write(command + '\n')

  return new Response('OK', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  })
}
