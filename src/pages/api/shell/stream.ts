import type { APIRoute } from 'astro'
import { ShellProcessManager } from '@/lib/linux/ShellProcessManager'
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
  console.log('[shell/stream] HEAD request:', cookies)
  const shellPidCookie = cookies.get('pid')
  const shell = processManager.getOrCreateShell(shellPidCookie?.number())

  const shellPidString = shell.pid.toString()
  console.log('[shell/stream] pid:', shellPidString)
  cookies.set('pid', shellPidString)

  return new Response('OK', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'x-shell-pid': shellPidString,
    },
  })
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
  console.log('[shell/stream] GET shell stream:', request.headers)

  const shellPidCookie = cookies.get('pid')
  const shellPid = shellPidCookie?.number()
  console.log('[shell/stream] shellPidCookie:', shellPidCookie)

  // get the shell from the process manager
  const shell = processManager.getOrCreateShell(shellPid)

  // update the cookie if the PIDs don't match
  if (shellPid !== shell.pid) {
    console.log(`[shell/stream] updated from:${shellPid} to:${shell.pid}`)
    cookies.set('pid', shell.pid.toString())
  }

  console.log('[shell/stream] shellPid:', shellPid)

  // get child process from the process manager
  const { childProcess } = shell

  // resolver for when the stream is finished
  let onStreamDidFinish: ((value: unknown) => void) | undefined

  // create a new readable stream
  const waitForStreamToFinish = new Promise((resolve) => {
    onStreamDidFinish = resolve
  })

  // create a new readable stream
  const stream = new ReadableStream({
    async start(controller) {
      const buffer: Uint8Array[] = []

      // setup an abort signal
      request.signal.onabort = () => {
        console.warn('[shell/stream] aborting...')
        childProcess.kill()
        controller.close()
      }

      // create a new writeable stream
      const output = new WritableStream({
        write(chunk) {
          // buffer chunks
          buffer.push(chunk)
          console.log('[shell/stream] buffer:', buffer)
          // only send data when ETX is detected
          if (chunk.includes(ETX.NUM)) {
            console.log('[shell/stream] ETX detected!')
            const output = buffer.join(',')
            controller.enqueue(`data: ${output}\n\n`)
            buffer.length = 0 // empty the buffer
          }

          onStreamDidFinish?.(true)
        },
        abort() {
          console.warn('[shell/stream] writeable stream aborted!')
          childProcess.kill()
          controller.close()
        },
        close() {
          console.warn('[shell/stream] writeable stream closed!')
          controller.close()
        },
      })

      console.log(
        '[shell/stream] waiting for child process:',
        childProcess.signalCode
      )

      childProcess.stdin.write('echo "Hello, world!";' + '\n')

      // pipe the output stream to the writeable stream
      await childProcess.stdout
        .pipeTo(output)
        .then(() => {
          console.log('[shell/stream] finished piping!')
        })
        .catch((err) => {
          console.error(`[shell/stream] ERROR stdout: \n\n\t${err}\n`)
          childProcess.kill()
          controller.close()
        })
        .finally(() => {
          console.log('[shell/stream] finally...')
        })
    },
    cancel() {
      console.warn('[shell/stream] killing child process!')
      childProcess.kill()
    },
  })

  console.log('[shell/stream] waiting for stream to finish...')
  await waitForStreamToFinish
  console.log('[shell/stream] stream finished!')

  if (stream.locked) {
    console.warn('[shell/stream] stream is locked!')
    return new Response('Stream is locked', { status: 500 })
  }

  const clientResponseStream = await new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
    status: 200,
  })

  return clientResponseStream
}

/**
 * POST /api/shell/stream
 *
 * Sends a command to the shell and streams the output.
 *
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  console.log('[shell/stream] POST request:', request.headers)
  const { command } = await request.json()

  const shellPidCookie = cookies.get('pid')
  const shellPid = shellPidCookie?.number()

  if (!shellPid) {
    console.warn('[shell/stream] missing PID cookie')
    return new Response('Missing PID cookie', { status: 404 })
  }

  console.log('[shell/stream] POST shellPid:', shellPid)

  const shell = processManager.getShell(shellPid)

  if (!shell) {
    return new Response('Shell not found', { status: 404 })
  }

  const { childProcess } = shell

  if (!command || typeof command !== 'string') {
    return new Response('Invalid command', { status: 400 })
  }

  if (!childProcess) {
    return new Response('Shell not initialized', { status: 500 })
  }

  if (childProcess.killed) {
    return new Response('Shell killed', { status: 500 })
  }

  if (!childProcess.stdin) {
    return new Response('Shell not initialized', { status: 500 })
  }

  if (typeof childProcess.stdin.write !== 'function') {
    return new Response('Shell is not writable', { status: 500 })
  }

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
}

