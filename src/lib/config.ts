//================================================
// Environment Variables
//================================================

export type HttpProtocol = 'http' | 'https'

export type HttpScheme = `${HttpProtocol}://`

export type Config = {
  protocol: HttpProtocol
  scheme: HttpScheme
  host: string
  port: number
  isDev: boolean
  baseUrl: URL
}

export function isValidProtocol(protocol: string | null): protocol is HttpProtocol {
  if (!protocol) return false
  return (protocol === 'http' || protocol === 'https')
}

export function isValidScheme(scheme: string): scheme is HttpScheme {
  return scheme === 'http://' || scheme === 'https://'
}

// console.assert(Bun.env.IS_DEV, '[http] Missing env var: IS_DEV')
// console.assert(Bun.env.PROTOCOL, '[http] Missing env var: PROTOCOL')
// console.assert(Bun.env.HOST, '[http] Missing env var: HOST')
// console.assert(Bun.env.PORT, '[http] Missing env var: PORT')

const isDev = Boolean(Bun.env.IS_DEV)
const protocol = String(Bun.env.PROTOCOL) as HttpProtocol
const scheme = String(`${protocol}://`) as HttpScheme
const host = String(Bun.env.HOST)
const port = Number(Bun.env.PORT)

const baseUrl = isDev
  ? new URL(`${scheme}${host}:${port}`)
  : new URL(`${scheme}${host}`)

const config: Config = {
  protocol,
  scheme,
  host,
  port,
  isDev,
  baseUrl,
}

export default config
