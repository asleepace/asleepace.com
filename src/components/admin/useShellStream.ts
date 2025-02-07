import type { ShellResponse } from '@/pages/api/shell'
import { useCallback, useEffect, useState } from 'react'
import { useShellPid } from './useShellPid'

/**
 * Helper function to log the shell response.
 */
const logShellResponse = (command: string) => (resp: Response) => {
  console.log(
    `[useShellStream] exec "${command}" (${resp.status}) ${resp.statusText}`
  )
}

/**
 * Helper function to log the shell error.
 */
const logShellError = (command: string) => (err: Error) => {
  console.error(`[useShellStream] exec "${command}" error:`, err)
}

/**
 * ## useShellStream()
 *
 * This hook receives events from the backend shell stream, this also handles
 * per-session shell pid management.
 *
 *    1. HEAD request to /api/shell/stream to get the current shell pid
 *    2. POST request to /api/shell/stream to execute a command
 *    3. Receives events from the server via Server-Sent Events
 *    4. Decodes the event data into a ShellResponse object
 *    5. Updates the output state with the new ShellResponse object
 *
 */
export function useShellStream() {
  const [output, setOutput] = useState<ShellResponse[]>([])
  const [commands, setCommands] = useState<string[]>([])

  // PART #0: Get the current shell pid
  const pid = useShellPid()

  // PART #1: Executes a command on the server
  const onRunCommand = useCallback((command: string) => {
    setCommands((prev) => [...prev, command])
    return fetch('/api/shell/stream', {
      method: 'POST',
      body: JSON.stringify({ command }),
    })
      .then(logShellResponse(command))
      .catch(logShellError(command))
  }, [pid])

  // PART #2: Receives events from the server
  useEffect(() => {
    if (!pid) return

    const eventSource = new EventSource('/api/shell/stream')
    const textDecoder = new TextDecoder()

    eventSource.onopen = () => {
      console.log('[useShellStream] eventSource.onopen()')
    }

    console.log('[useShellStream] eventSource:', eventSource)
    console.log(
      '[useShellStream] eventSource.readyState:',
      eventSource.readyState
    )

    eventSource.onmessage = (event) => {
      console.log('[useShellStream] event:', event)

      if (typeof event.data !== 'string') {
        console.error(
          '[useShellStream] event.data is not a string:',
          event.data
        )
        return
      }

      const rawBytes = new Uint8Array(event.data.split(',').map(Number))

      const endOfText = rawBytes.findLastIndex((byte) => byte === 0x03)
      console.log('[useShellStream] endOfText:', endOfText)

      const output = textDecoder.decode(rawBytes.slice(0, endOfText))
      const rawMetadata = textDecoder.decode(rawBytes.slice(endOfText + 1))
      console.log('[useShellStream] output:', output)
      console.log('[useShellStream] rawMetadata:', rawMetadata)

      const meta = JSON.parse(rawMetadata.trim())

      const resp: ShellResponse = {
        command: meta.cmd?.split(' ') ?? [],
        output,
        whoami: meta.usr,
        pwd: meta.dir,
        type: 'command',
      }

      setOutput((prev) => [...prev, resp])
    }

    eventSource.onerror = (error) => {
      console.log('[useShellStream] error:', error)
    }

    return () => {
      console.warn('[useShellStream] closing eventSource...')
      eventSource.close()
    }
  }, [pid])

  /**
   * Output is a list of ShellResponse objects.
   */
  return [output, onRunCommand] as const
}
