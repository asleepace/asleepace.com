function getIpAddressFromHeaders(headers) {
  return headers.get("cf-connecting-ip") ?? getFirstForwardedIpAddress(headers.get("x-forwarded-for")) ?? headers.get("x-real-ip") ?? headers.get("fastly-client-ip") ?? headers.get("true-client-ip") ?? headers.get("x-cluster-client-ip") ?? headers.get("x-envoy-external-address") ?? headers.get("x-forwarded-host") ?? headers.get("remote-addr");
}
function getFirstForwardedIpAddress(xForwardedFor) {
  if (!xForwardedFor) return void 0;
  const ips = xForwardedFor.split(",");
  if (ips.length === 0) return void 0;
  return ips.at(0)?.trim();
}

export { getIpAddressFromHeaders as g };
