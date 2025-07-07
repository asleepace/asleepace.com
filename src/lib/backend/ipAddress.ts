/**
 * Attempts to get the ip address from the headers object.
 */
export function getIpAddressFromHeaders(headers: Headers) {
  return (
    headers.get('cf-connecting-ip') ??
    getFirstForwardedIpAddress(headers.get('x-forwarded-for')) ??
    headers.get('x-real-ip') ??
    headers.get('fastly-client-ip') ??
    headers.get('true-client-ip') ??
    headers.get('x-cluster-client-ip') ??
    headers.get('x-envoy-external-address') ??
    headers.get('x-forwarded-host') ??
    headers.get('remote-addr')
  )
}

/**
 * Attempts to get the first ip address from the x-forwarded-for header.
 */
export function getFirstForwardedIpAddress(xForwardedFor: string | null | undefined) {
  if (!xForwardedFor) return undefined
  const ips = xForwardedFor.split(',')
  if (ips.length === 0) return undefined
  return ips.at(0)?.trim()
}

export function isValidIpAddressV4(ipAddress: string): boolean {
  return /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipAddress)
}

export function isValidIpAddressV6(ipAddress: string): boolean {
  return /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(ipAddress)
}
