import type { ShellResponse } from '@/lib/shell'

const textDecoder = new TextDecoder()

/**
 * ## parseClientData(event)
 *
 * Parses the client data from the shell stream.
 *
 * Message data should be a comma seperated string which represents a UInt8Array,
 * along with json encoded metadata seperated by special char ETX (0x03)
 *
 * NOTE: This will discard empty or invalid messages.
 *
 */
export function parseClientData(
  event: MessageEvent
): ShellResponse | undefined {
  if (!event.data) return undefined

  // parse the message data and metadata
  const rawBytes = new Uint8Array(event.data.split(',').map(Number))
  const endOfText = rawBytes.findLastIndex((byte) => byte === 0x03)
  const output = textDecoder.decode(rawBytes.slice(0, endOfText))
  const rawMetadata = textDecoder.decode(rawBytes.slice(endOfText + 1))

  // check if metadata is empty
  const trimmedMetadata = rawMetadata.trim()

  // check if metadata is valid JSON
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
