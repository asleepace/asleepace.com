import { useCallback, useEffect } from 'react'
import { usePid } from './usePid'
import { useEventSource } from './useEventSource'
import { parseClientData } from '../logic/parseClientData'

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
  const [pid, onStartPid, onResetPid] = usePid()

  // subcribe to server events
  const { messages, subscribeToEventSource, state } =
    useEventSource(parseClientData)

  // this callback is used to register a new shell
  const onRegisterShell = useCallback(async () => {
    try {
      const pid = await onStartPid()
      if (!pid) throw new Error('missing pid')
      subscribeToEventSource(`/api/shell/stream?pid=${pid}`)
    } catch (error) {
      console.warn('[useShellStream] error registering shell:', error)
    }
  }, [onStartPid, subscribeToEventSource])

  // execute a command on the server
  const onRunCommand = useCallback(
    (command: string) => {
      return fetch('/api/shell/stream', {
        method: 'POST',
        body: JSON.stringify({ command }),
      })
        .then((resp) => {
          if (resp.status !== 200) throw new Error(resp.statusText)
          return resp
        })
        .catch((err) => {
          console.error('[useShellStream] error:', err)
          onResetPid()
        })
    },
    [pid, onResetPid]
  )

  /**
   * Output is a list of ShellResponse objects.
   */
  return [messages, onRunCommand, onRegisterShell] as const
}
