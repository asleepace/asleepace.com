import { useCallback } from 'react'
import { usePid } from './usePid'
import { useEventSource } from './useEventSource'
import { parseClientData } from '../logic/parseClientData'

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
  // --- manage the shell pid ---

  const [pid, onStartPid, onResetPid] = usePid()

  // --- subscribe to server events ---

  const { messages, subscribeToEventSource } = useEventSource(parseClientData)

  // --- register a new shell ---

  const onRegisterShell = useCallback(async () => {
    try {
      const pid = await onStartPid()
      if (!pid) throw new Error('missing pid')
      subscribeToEventSource(`/api/shell/stream?pid=${pid}`)
    } catch (error) {
      console.warn('[useShellStream] error registering shell:', error)
    }
  }, [onStartPid, subscribeToEventSource])

  // --- execute a command on the server ---

  const onRunCommand = useCallback(
    async (command: string) => {
      try {
        const resp = await fetch('/api/shell/stream', {
          method: 'POST',
          body: JSON.stringify({ command }),
        })

        if (resp.status !== 200) {
          throw new Error(resp.statusText)
        }

        return resp
      } catch (error) {
        console.error('[useShellStream] error:', error)
        onResetPid()
      }
    },
    [pid, onResetPid]
  )

  // --- return the messages and the commands ---

  return [messages, onRunCommand, onRegisterShell] as const
}
