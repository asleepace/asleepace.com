import type { ShellResponse } from '@/pages/api/shell'
import { useCallback, useEffect, useState } from 'react'

/**
 * ## useShellStream()
 *
 * This hook receives events from the backend shell stream.
 *
 */
export function useShellStream() {
  const [output, setOutput] = useState<ShellResponse[]>([])
  const [commands, setCommands] = useState<string[]>([])

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

    console.log('[shell/stream] eventSource:', eventSource)
    console.log('[shell/stream] eventSource.readyState:', eventSource.readyState)

    eventSource.onmessage = (event) => {
      console.log('[shell/stream] event:', event)

      if (typeof event.data !== 'string') {
        console.error('[shell/stream] event.data is not a string:', event.data)
        return
      }

      const rawBytes = new Uint8Array(event.data.split(',').map(Number))

      const endOfText = rawBytes.findLastIndex((byte) => byte === 0x03)
      console.log('[shell/stream] endOfText:', endOfText)

      const output = textDecoder.decode(rawBytes.slice(0, endOfText))
      const rawMetadata = textDecoder.decode(rawBytes.slice(endOfText + 1))
      console.log('[shell/stream] output:', output)
      console.log('[shell/stream] rawMetadata:', rawMetadata)

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
      console.error('[shell/stream] error:', error)
    }

    return () => {
      console.log('[shell/stream] eventSource.close()')
      eventSource.close()
    }
  }, [])

  /**
   * Output is a list of ShellResponse objects.
   */
  return [output, onRunCommand] as const
}
