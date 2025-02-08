import type { ShellResponse } from '@/pages/api/shell'

const textDecoder = new TextDecoder()

/**
 * ## parseClientData()
 *
 * Parses the client data from the shell stream.
 *
 */
export function parseClientData(event: MessageEvent): ShellResponse {
  const rawBytes = new Uint8Array(event.data.split(',').map(Number))
  const endOfText = rawBytes.findLastIndex((byte) => byte === 0x03)
  // console.log('[parseClientData] endOfText:', endOfText)

  const output = textDecoder.decode(rawBytes.slice(0, endOfText))
  const rawMetadata = textDecoder.decode(rawBytes.slice(endOfText + 1))
  // console.log('[parseClientData] output:', output)
  // console.log('[parseClientData] rawMetadata:', rawMetadata)

  const meta = JSON.parse(rawMetadata.trim())

  const resp: ShellResponse = {
    command: meta.cmd?.split(' ') ?? [],
    output,
    whoami: meta.usr,
    pwd: meta.dir,
    type: 'command',
  }

  return resp
}
