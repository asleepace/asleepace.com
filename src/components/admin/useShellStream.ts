import type { ShellResponse } from '@/pages/api/shell'
import { useCallback, useEffect, useState } from 'react'
import { useShellPid } from './useShellPid'
import { useEventSource } from './useEventSource'

/**
 * Helper function to log the shell response.
 */
const logShellResponse = (command: string) => (resp: Response) => {
  console.log(
    `[useShellStream] exec "${command}" (${resp.status}) ${resp.statusText}`
  )
}

/**
 * For decoding the shell stream.
 */
const textDecoder = new TextDecoder()

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
  const [pid, onResetPid] = useShellPid()

  // only subscribe to events if we have a pid
  const eventStreamUrl = pid ? `/api/shell/stream?pid=${pid}` : undefined

  // subcribe to server events
  const { messages, error, state } = useEventSource(eventStreamUrl, (event) => {
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

    return resp
  })

  // derive state variables
  const isConnected = state === 'connected'

  useEffect(() => {
    console.log('[useShellStream] pid:', pid)
  }, [pid])

  // execute a command on the server
  const onRunCommand = useCallback(
    (command: string) => {
      return fetch('/api/shell/stream', {
        method: 'POST',
        body: JSON.stringify({ command }),
      })
        .then((resp) => {
          if (resp.status !== 200) {
            throw new Error(resp.statusText)
          }
          console.log('[useShellStream] onRunCommand:', resp)
          logShellResponse(command)(resp)
          return resp
        })
        .catch((err) => {
          console.error('[useShellStream] error:', err)
          onResetPid()
        })
    },
    [pid, isConnected, onResetPid]
  )

  /**
   * Output is a list of ShellResponse objects.
   */
  return [messages, onRunCommand] as const
}
