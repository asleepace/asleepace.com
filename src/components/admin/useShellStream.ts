import type { ShellResponse } from '@/pages/api/shell'
import { useCallback, useEffect, useState } from 'react'

function useShellPid() {
  const [pid, setPid] = useState<number | undefined>(undefined)

  useEffect(() => {
    fetch('/api/shell/stream', { method: 'HEAD' })
      .then((resp) => {
        console.log('[useShellPid] resp:', resp)
        return resp.json()
      })
      .then((data) => setPid(data.pid))
      .catch((err) => {
        console.error('[useShellPid] error:', err)
      })
  }, [])

  return pid
}


/**
 * ## useShellStream()
 *
 * This hook receives events from the backend shell stream.
 *
 */
export function useShellStream() {
  const [output, setOutput] = useState<ShellResponse[]>([])
  const [commands, setCommands] = useState<string[]>([])

  const pid = useShellPid()
  console.log('[useShellStream] pid:', pid)

  // PART #1: Executes a command on the server
  const onRunCommand = useCallback((command: string) => {
    setCommands((prev) => [...prev, command])
    return fetch('/api/shell/stream', {
      method: 'POST',
      body: JSON.stringify({ command }),
    })
      .then((resp) => {
        console.log(
          `[useShellStream] exec "${command}" ({ code: ${resp.status}, status: ${resp.statusText} })`
        )
      })
      .catch((err) => {
        console.error(`[useShellStream] exec:"${command}" error:`, err)
      })
  }, [])

  // PART #2: Receives events from the server
  useEffect(() => {
    const eventSource = new EventSource('/api/shell/stream')
    const textDecoder = new TextDecoder()

    eventSource.onopen = () => {
      console.log('[useShellStream] eventSource.onopen()')
    }

    console.log('[useShellStream] eventSource:', eventSource)
    console.log('[useShellStream] eventSource.readyState:', eventSource.readyState)

    eventSource.onmessage = (event) => {
      console.log('[useShellStream] event:', event)

      if (typeof event.data !== 'string') {
        console.error('[useShellStream] event.data is not a string:', event.data)
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
      console.warn('[useShellStream] eventSource.close()')
      eventSource.close()
    }
  }, [])

  /**
   * Output is a list of ShellResponse objects.
   */
  return [output, onRunCommand] as const
}
