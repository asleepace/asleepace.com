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
