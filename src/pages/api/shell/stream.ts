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
 * ## ETX
 *
 * End of Text (ETX) is the ASCII character 3, which is used to indicate the end of a message.
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

const cleanup = {
  [Symbol.dispose]: () => {
    console.log('[shell/stream] cleanup...')
    console.log('[shell/stream] killing child process!!!!!!!!!!!!!!')
    childShellProcess.kill()
  },
}

/**
 * GET /api/shell/stream
 *
 * Streams the output of the shell.
 *
 */
export const GET: APIRoute = async ({ request }) => {
  console.log('[shell/stream] GET shell stream...')
  const stream = new ReadableStream({
    async start(controller) {
      const buffer: Uint8Array[] = []

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
        },
        close() {
          console.warn('[shell/stream] output stream closed!')
          controller.close()
        },
      })

      await childShellProcess.stdout.pipeTo(output).catch((err) => {
        console.error(`[shell/stream] ERROR stdout: \n\n${err}\n`)
        childShellProcess.kill()
        controller.close()
      })
    },
    cancel() {
      console.warn('[shell/stream] killing child process!')
      childShellProcess.kill()
    },
  })

  if (stream.locked) {
    console.warn('[shell/stream] stream is locked!')
    return new Response('Stream is locked', { status: 500 })
  }

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
  // childShellProcess.stdin.write(command + '\n')

  // childShellProcess.stdin.write(
  //   `printf '{"usr":"%s","cwd":"%s","cmd":"%s","out":"%s"}\n' "$(whoami)" "$(pwd)" "${command}" "$(${command})"\n`
  // )

  childShellProcess.stdin.write(
    `${command} | (echo "$(cat -)\x03{\\"cmd\\":\\"${command}\\",\\"usr\\":\\"$USER\\",\\"dir\\":\\"$PWD\\"}";)\n`
  )

  return new Response('OK', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  })
}
