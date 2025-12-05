/**
 * ## Network Commands
 *
 * These commands are used to capture network traffic and analyze it.
 */
export const Commands = {
  ARP_A: 'arp -a',
  TCP_DUMP: 'sudo tcpdump -i any',
  TCP_DUMP_FILTER_ARP: 'sudo tcpdump -vvv -i any arp',

  TCP_DUMP_FILTER_IP: (ipAddress: string) =>
    `sudo tcpdump -i any -n host ${ipAddress}`,
}

type NetworkInfoParams = {
  ipAddress?: string
}

/**
 * ## getNetworkInfo()
 *
 * This function runs the `tcpdump` command and returns the output as a string,
 * can pass in an optional `ipAddress` to filter the output by a specific IP address.
 *
 */
export async function getNetworkInfo({ ipAddress }: NetworkInfoParams) {
  const cmnd = ipAddress
    ? Commands.TCP_DUMP_FILTER_IP(ipAddress)
    : Commands.TCP_DUMP_FILTER_ARP

  const proc = Bun.spawn(cmnd.split(' '), {
    stdout: 'pipe',
  })

  const output = await new Response(proc.stdout).text()
  return output
}
