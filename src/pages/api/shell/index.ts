import type { APIRoute } from 'astro'
import type { Subprocess, WritableSubprocess } from 'bun'

/**
 * POST /api/shell
 *
 * Opens a long-running process and returns the output as a stream.
 *
 */

export const prerender = false

/**
 * Spawns a child process which allows us to interact with the shell.
 */
// const shell = Bun.spawn(['bun', 'scripts/online-shell.ts'], {
//   serialization: 'json',
//   cwd: process.env.PWD,
//   stdin: 'pipe',
//   ipc(message, childProc) {
//     console.log(
//       '[shell] received message from child process:',
//       childProc.pid,
//       message
//     )
//     resolveChildProcessOutput?.(message)
//     resolveChildProcessOutput = undefined
//   },
//   onExit(subprocess, exitCode, signalCode, error) {
//     console.log(
//       '[shell] exited with code',
//       exitCode,
//       'signal',
//       signalCode,
//       'error',
//       error
//     )
//     rejecterChildProcessOutput?.(new Error('Shell exited'))
//     rejecterChildProcessOutput = undefined
//   },
// })

// console.log('[shell] spawned:', shell.pid)

let shell: Subprocess<any, any, any> | undefined

const HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'Transfer-Encoding': 'chunked',
  'Cache-Control': 'no-cache',
}

const OPTIONS = {
  headers: HEADERS,
}

const WHOAMI = String(process.env.USER)
const PWD = String(process.env.PWD)

export type ShellResponse = {
  type?: 'command' | 'error'
  command: string[]
  output: string
  whoami: string
  pwd: string
}

function ShellResponse(
  type: 'command' | 'error',
  command: string[],
  output: string
) {
  const status = type === 'command' ? 200 : 500
  const resp: ShellResponse = {
    type,
    command,
    output,
    whoami: WHOAMI,
    pwd: PWD,
  }
  return new Response(JSON.stringify(resp), { status, headers: HEADERS })
}

const CreateBunShell = () => {
  return Bun.spawn(['bun', 'scripts/shell.ts'], {
    stdin: 'pipe',
    stdout: 'pipe',
    stderr: 'pipe',
    ipc(message, subprocess) {
      console.log('[shell] ipc:', message)
    },
    onExit(subprocess, exitCode, signalCode, error) {
      console.log(
        '[shell] onExit code:',
        exitCode,
        'signal',
        signalCode,
        'error',
        error
      )
    },
  })
}

/**
 * POST /api/shell
 *
 * Runs a command in the shell and returns the output.
 *
 */
export const POST: APIRoute = async ({ request }) => {
  const args = await request.json()

  if (!args.command || typeof args.command !== 'string') {
    return ShellResponse('error', [], 'INVALID COMMAND')
  }

  const commands = args.command.split(' ')

  console.log('=============================================================')
  console.log('[shell] ARGS:', args)
  console.log(`[shell] PID: ${shell?.pid} KILLED: ${shell?.killed}`)

  // initialize shell
  if (!shell || shell.killed) {
    console.log('[shell] initializing shell...')
    shell = Bun.spawn(['bun', 'scripts/shell.ts'], {
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      ipc(message, subprocess) {
        console.log('[shell] ipc:', message)
      },
      onExit(subprocess, exitCode, signalCode, error) {
        console.log(
          '[shell] onExit code:',
          exitCode,
          'signal',
          signalCode,
          'error',
          error
        )
      },
    })
  }

  if (!shell) return ShellResponse('error', commands, 'ERROR: SHELL_NOT_FOUND')
  if (shell.killed)
    return ShellResponse('error', commands, 'ERROR: SHELL_KILLED')
  if (!shell.stdin)
    return ShellResponse('error', commands, 'ERROR: SHELL_NOT_WRITABLE')
  if (typeof shell.stdin === 'number')
    return ShellResponse('error', commands, 'ERROR: SHELL_INVALID_STDIN')
  if (typeof shell.stdout === 'number')
    return ShellResponse('error', commands, 'ERROR: SHELL_INVALID_STDOUT')

  console.log(`[shell] exec: "${args.command}"`)

  shell.stdin.write(args.command)
  shell.stdin.flush()
  shell.stdin.end()

  console.log('[shell] reading stdout...')

  const data = await new Response(shell.stdout).text()

  console.log('[shell] stdout:', data)

  return ShellResponse('command', commands, data)
}
