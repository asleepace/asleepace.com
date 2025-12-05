import type { APIRoute } from 'astro'
import { ShellProcessManager } from '@/lib/server/linux/ShellProcessManager'
import { createBufferedStream } from '@/lib/server/linux/createBufferedStream'
import { sleep } from '@/lib/utils/sleep'
import chalk from 'chalk'

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
 * ## Shell Stream Data
 *
 * The data sent from the client to the server.
 *
 */
export type ShellStreamData = {
  type: 'command' | 'error'
  command: string | undefined
  bytes: Uint8Array
  pid: number
}

const TAG = (prefix: string) => chalk.gray(`[${prefix}] ↳ /stream\t`)

/**
 * HEAD /api/shell/stream
 *
 * This will create a new shell and set the cookie 'pid' to the shell pid,
 * this should be called before connecting to the shell stream or posting
 * commands to the shell.
 *
 * @note streams require additional nginx configuration and the endpoints
 *       must either end in `/events` or `/stream` to be detected as a
 *       stream.
 *
 * @see nginx/asleepace.com.conf
 *
 */
export const HEAD: APIRoute = async ({ cookies }) => {
  try {
    // cleanup any killed shells
    processManager.runCleanup()

    // start a new shell
    const shell = processManager.startShell()
    console.log(TAG('H'), chalk.white('PID:'), chalk.yellow(shell.pid))

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
    console.error(TAG('H'), chalk.red(error))

    // clear any existing cookies
    cookies.delete('pid', { path: '/' })

    return new Response(null, {
      statusText: error.message ?? 'Unknown error',
      status: 500,
    })
  } finally {
    // cleanup any existing shell
    processManager.runCleanup()
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
  const pid = cookies.get('pid')?.number()

  if (!pid) {
    console.warn('[GET] Missing PID cookie')
    return new Response(null, { status: 404, statusText: 'Missing PID' })
  }

  // cleanup any killed shells
  processManager.runCleanup()

  // TODO: This should not create a new shell if it has already been killed
  // and instead return and error.
  const shell = processManager.getOrCreateShell(pid)

  console.log(
    TAG('G'),
    chalk.white('PID:'),
    chalk.yellow(pid),
    shell.childProcess.killed ? chalk.red('(killed)') : '(alive)'
  )

  // check if the shell has already been killed
  if (shell.childProcess.killed) {
    console.warn(TAG('G'), chalk.red('shell killed!'))
    cookies.delete('pid', { path: '/' })
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

  const STREAM_TAG = chalk.gray('[G][stream]')

  // create a new readable stream
  const stream = new ReadableStream({
    async start(controller) {
      console.log(STREAM_TAG, chalk.gray('starting readbale stream'))

      // setup an abort signal
      request.signal.onabort = () => {
        console.warn(STREAM_TAG, chalk.red('request aborted, closing stream...'))
        controller.close()
      }

      // create a new writeable buffered stream which pipes the childProcess stdout
      // and enqueues the data to the controller
      const bufferedStream = createBufferedStream(controller)

      // HACK: Connecting the childProcess stdout to the controller is async,
      // so we need to wait for the stream to be ready before we can send the
      // ETX event to the client.
      setTimeout(() => {
        console.log(STREAM_TAG, chalk.gray('ready!'))
        onStreamReady?.(true)
      }, 300)

      // HACK: This will cause the client connection to connect after the
      // stream response has been sent. Make sure this triggers slightly
      // after we return the stream response and client has time to make
      // an event source connection.
      setTimeout(() => {
        console.log(STREAM_TAG, chalk.white('initial enqueue!'))
        controller.enqueue('data: \x03\n\n')
      }, 1_000)

      // pipe the childProcess stdout to the buffered stream, not sure if this
      // needs to be returned here or awaited, but this is where we create a
      // pipe from the childProcess.stdout to the buffered writeable stream.
      return childProcess.stdout
        .pipeTo(bufferedStream)
        .then(() => {
          console.log(STREAM_TAG, 'piped!')
        })
        .catch((err) => {
          console.warn(STREAM_TAG, chalk.red(err))
          controller.close()
        })
    },
    cancel() {
      console.warn(STREAM_TAG, chalk.yellow('cancelling...'))
      childProcess.kill()
      processManager.runCleanup()
    },
  })

  console.log(STREAM_TAG, chalk.gray('waiting...'))
  await waitForStreamToFinish

  if (stream.locked) {
    console.warn(STREAM_TAG, chalk.yellow('locked!'), chalk.gray('sleeping 1s'))
    await sleep(1_000)
  }

  console.log(STREAM_TAG, chalk.gray('finished!'))

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
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const shellPid = cookies.get('pid')?.number()
    console.log('[POST] PID:', shellPid)

    // parse the command from the request body
    const { command } = await request.json().catch(async (error) => {
      console.log('[POST] JSON error:', error?.message ?? 'Unknown error')
      const plainText = await request.text()
      return JSON.parse(plainText)
    })

    if (!shellPid) throw new Error('Missing PID cookie')

    console.log('[shell/stream] POST shellPid:', shellPid)

    const shell = processManager.getShell(shellPid)

    if (!shell) throw new Error('Shell not found')

    const { childProcess } = shell

    // handle various errors
    if (!command || typeof command !== 'string') throw new Error('Invalid command')
    if (!childProcess) throw new Error('Shell not initialized')
    if (childProcess.killed) throw new Error('Shell killed')
    if (!childProcess.stdin) throw new Error('Shell is not writable')
    if (typeof childProcess.stdin.write !== 'function') throw new Error('Shell stdin is not writable')

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
