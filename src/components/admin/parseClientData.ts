import type { ShellResponse } from '@/pages/api/shell'

const textDecoder = new TextDecoder()

/**
 * ## parseClientData()
 *
 * Parses the client data from the shell stream.
 *
 */
export function parseClientData(
  event: MessageEvent
): ShellResponse | undefined {
  if (!event.data) return undefined

  const rawBytes = new Uint8Array(event.data.split(',').map(Number))
  const endOfText = rawBytes.findLastIndex((byte) => byte === 0x03)
  const output = textDecoder.decode(rawBytes.slice(0, endOfText))
  const rawMetadata = textDecoder.decode(rawBytes.slice(endOfText + 1))

  // check if metadata is empty
  const trimmedMetadata = rawMetadata.trim()
  if (!trimmedMetadata || !trimmedMetadata.startsWith('{')) return undefined

  const meta = JSON.parse(trimmedMetadata)

  const resp: ShellResponse = {
    command: meta.cmd?.split(' ') ?? [],
    output,
    whoami: meta.usr,
    pwd: meta.dir,
    type: 'command',
  }

  return resp
}
