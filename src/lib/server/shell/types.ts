/**
 * ## Shell Stream Data
 *
 * The data sent from the client to the server.
 *
 */
export type ShellStreamData = {
  type: 'command' | 'error'
  command: string | undefined
  bytes: Uint8Array
  pid: number
}

/**
 * ## Shell Response
 *
 * The response from the server to the client.
 *
 */
export type ShellResponse = {
  type?: 'command' | 'error'
  command: string[]
  output: string
  whoami: string
  pwd: string
}
