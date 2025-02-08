import type { APIRoute } from 'astro'
import { ShellProcessManager } from '@/lib/linux/ShellProcessManager'
import { createBufferedStream } from '@/lib/linux/createBufferedStream'
/**
 * ## SSR Only
 *
 * This API should only be executed in a severside context.
 *
 */
export const prerender = false

/**
 * ## Shell Process Manager
 *
 * Manages the shell processes for each PID
 *
 */
const processManager = new ShellProcessManager()

/**
/**
 * ## ETX
 *
 * End of Text (ETX) is the ASCII character 3, which is used to indicate the end of a message,
 * this is given as both a string and binary representation.
 *
 */
const ETX = {
  STR: '\x03',
  NUM: 0x03,
}

export type ShellStreamData = {
  type: 'command' | 'error'
  command: string | undefined
  bytes: Uint8Array
  pid: number
}

/**
 * HEAD /api/shell/stream
 *
 * Call this to get the current shell pid or create a new one if it doesn't exist,
 * this will be set as the cookie 'pid' and returned in the response headers
 * as `x-shell-pid`.
 *
 */
export const HEAD: APIRoute = async ({ request, cookies }) => {
  try {
    console.log(
      '||--------------------------------------------------------------------------------------------------||'
    )

    // const shellPidCookie = cookies.get('pid')
    // console.log('[HEAD] PID:', shellPidCookie?.number())
    processManager.runCleanup()

    ///const clientPid = Number(shellPidCookie?.number())

    // start a new shell
    const shell = processManager.startShell()
    console.log('[HEAD] shell:', shell.pid)

    // set cookie to proper shell pid
    cookies.set('pid', shell.pid.toString())

    // return response
    return new Response(null, {
      statusText: 'OK',
      status: 200,
      headers: {
        'x-shell-pid': shell.pid.toString(),
      },
    })
  } catch (error) {
    console.error('[shell/stream] error:', error)

    // clear any existing cookies
    cookies.delete('pid')

    // cleanup any existing shell
    processManager.runCleanup()

    // return error response
    return new Response(null, {
      statusText: error.message ?? 'Unknown error',
      status: 500,
    })
  }
}

/**
 * GET /api/shell/stream
 *
 * Streams the output of the shell via a server-sent event.
 *
 *  1. Create a new readable stream to be sent to the client
 *  2. Pipe output from the childProcess to a writeable stream in chunks
 *  3. When the end of text (ETX) is detected send to client
 *  4. Handle edge cases and cleanup gracefully
 *
 */
export const GET: APIRoute = async ({ request, cookies }) => {
  console.log(
    '||==================================================================================================||'
  )

  const pid = cookies.get('pid')?.number()

  if (!pid) {
    console.warn('[GET] Missing PID cookie')
    return new Response(null, { status: 404, statusText: 'Missing PID' })
  }

  processManager.runCleanup()

  const shell = processManager.getOrCreateShell(pid)

  console.log('[GET] shell:', shell.pid, 'killed:', shell.childProcess.killed)

  // check if the shell has already been killed
  if (shell.childProcess.killed) {
    console.warn('[GET] shell has already been killed!')
    cookies.delete('pid')
    return new Response(null, {
      statusText: 'Shell killed',
      status: 500,
    })
  }

  // get child process from the process manager
  const { childProcess } = shell

  // resolver for when the stream is finished
  let onStreamReady: ((value: unknown) => void) | undefined

  // create a new readable stream
  const waitForStreamToFinish = new Promise((resolve) => {
    onStreamReady = resolve
  })

  // create a new readable stream
  const stream = new ReadableStream({
    async start(controller) {
      console.log('[GET] starting stream...')

      // setup an abort signal
      request.signal.onabort = () => {
        console.warn('[shell/stream] aborting...')
        controller.close()
      }

      // create a new writeable stream
      const bufferedStream = createBufferedStream(controller)

      // childProcess.stdin.write('echo "Hello, world!";' + '\n\n')
      // onStreamDidFinish?.(true)

      console.log('[stream] childProcess stdout:', childProcess.stdout)

      setTimeout(() => {
        console.log('[stream] stream ready!')
        onStreamReady?.(true)
      }, 300)

      setTimeout(() => {
        controller.enqueue('data: \x03\n\n')
      }, 1_000)

      // pipe the childProcess stdout to the buffered stream
      return childProcess.stdout
        .pipeTo(bufferedStream)
        .then(() => {
          console.log('[stream] finished piping!')
        })
        .catch((err) => {
          console.warn(`[stream] childProcess error: \n\n\t${err}\n`)
          controller.close()
        })
        .finally(() => {
          console.log('[stream] childProcess finally...')
        })
    },
    cancel() {
      console.warn('[stream] canceling...')
      childProcess.kill()
      processManager.runCleanup()
    },
  })

  console.log('[stream] waiting for stream...')
  await waitForStreamToFinish

  // if (stream.locked) {
  //   console.warn('[shell/stream] stream is locked!')
  //   return new Response('Stream is locked', { status: 500 })
  // }

  const clientResponseStream = await new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
    status: 200,
  })

  console.log('[stream] stream returned!')

  return clientResponseStream
}

/**
 * POST /api/shell/stream
 *
 * Sends a command to the shell and streams the output.
 *
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // console.log('[shell/stream] POST request:', request.headers)
    const { command } = await request.json()

    const shellPid = cookies.get('pid')?.number()

    if (!shellPid) throw new Error('Missing PID cookie')

    console.log('[shell/stream] POST shellPid:', shellPid)

    const shell = processManager.getShell(shellPid)

    if (!shell) throw new Error('Shell not found')

    const { childProcess } = shell

    if (!command || typeof command !== 'string')
      throw new Error('Invalid command')

    if (!childProcess) throw new Error('Shell not initialized')

    if (childProcess.killed) throw new Error('Shell killed')

    if (!childProcess.stdin) throw new Error('Shell is not writable')

    if (typeof childProcess.stdin.write !== 'function')
      throw new Error('Shell stdin is not writable')

    console.log('[shell/stream] writing command:', command)

    // NOTE: This part is a bit tricky
    // 1. We need to execute the command first
    // 2. We need to mark the end with ETX 0x03
    // 3. We need to send the metadata after the command has finished
    // 4. TODO: do we need to send and end of command marker?
    childProcess.stdin.write(
      `${command}\n
    echo "\x03{\\"cmd\\":\\"${command}\\",\\"usr\\":\\"$USER\\",\\"dir\\":\\"$PWD\\"}";\n`
    )

    return new Response('OK', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  } catch (error) {
    console.error('[shell/stream] error:', error)
    return new Response(null, {
      statusText: error.message ?? 'Unknown error',
      status: 500,
    })
  }
}
