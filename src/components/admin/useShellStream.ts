import type { ShellResponse } from '@/pages/api/shell'
import { useCallback, useEffect, useState } from 'react'

/**
 * ## useShellStream()
 *
 * This hook receives events from the backend shell stream.
 *
 */
export function useShellStream() {
  const [output, setOutput] = useState<string[]>([])
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

    eventSource.onmessage = (event) => {
      console.log('[shell/stream] event:', event)

      const byteArray = new Uint8Array(event.data.split(',').map(Number))

      const data = textDecoder.decode(byteArray)

      setOutput((prev) => [...prev, data])
    }

    eventSource.onerror = (error) => {
      console.error('[shell/stream] error:', error)
    }

    return () => {
      eventSource.close()
    }
  }, [])

  const formattedOutput = output.map((data, index) => {
    const command = commands.at(index)?.split(' ') ?? []
    const shellResponse: ShellResponse = {
      command,
      output: data,
      whoami: 'system',
      pwd: 'error',
      type: 'command',
    }
    return shellResponse
  })

  return [formattedOutput, onRunCommand] as const
}
