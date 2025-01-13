# SMTP

This is a guide for settings up an SMTP server using Postfix, as well as how to connect to it from your local machine. You can also view some [example](./examples.md) of what the actual message looks like once they are sent. The preferred method is to use the `telnet` command to send the message from your local machine.

## Quick Start

```bash
# Send an email
echo "Test message" | mail -s "Test Subject" colin_teahan@yahoo.com

# Open interactive terminal
telnet localhost 25   # (remote server)
telnet localhost 2525 # (local comp)

# Check the mail queue
mailq

# Postfix Commands (macOS)
sudo killall postfix
sudo postsuper -d ALL
sudo postfix reload
sudo postfix stop
sudo postfix start

# Postfix Commands (Ubuntu)
sudo systemctl restart postfix
sudo systemctl stop postfix
sudo systemctl start postfix

# SSH Tunnel (local)
ssh -f -N -L 2525:localhost:25 root@asleepace.com
```

## Installation

There are two parts to the installation process, the first is the Postfix server and the second is the local machine. The second step is optional, but recommended to help with debugging and troubleshooting.

```bash
# connect to the remote server
ssh root@asleepace.com

# install Postfix
sudo apt-get install mailutils

# check the current version of Postfix
postconf -d

# edit the main.cf file (see ./services/smtp/main.cf)
sudo nano /etc/postfix/main.cf

# restart Postfix
sudo systemctl restart postfix
```

## Postfix

```bash
# edit the main.cf file
sudo nano /etc/postfix/main.cf
```

## Troubleshooting

If you are having an issue sending emails check the mail queue with the following command `mailq`, if you see something like this:

```bash
-Queue ID-  --Size-- ----Arrival Time---- -Sender/Recipient-------
D4008202F6A04      337 Fri Jan 10 20:14:11  asleepace@paradox.local
(Host or domain name not found. Name service error for name=localhost type=AAAA: Host not found)
                                         colin@wallwisher.com

38543202F7907      337 Fri Jan 10 20:43:27  asleepace@paradox.local
(Host or domain name not found. Name service error for name=localhost type=AAAA: Host not found)
                                         colin_teahan@yahoo.com

23816202F6CD7      337 Fri Jan 10 20:19:20  asleepace@paradox.local
(Host or domain name not found. Name service error for name=localhost type=AAAA: Host not found)
                                         colin@wallwisher.com

-- 0 Kbytes in 3 Requests.
```

This means that the mail server is not able to find the hostname, try the following on your local machine which is running the SSH Tunnel to your remote server:

```bash
# edit the main.cf file
sudo nano /etc/postfix/main.cf
```

add the following line to the end of the file

```conf
relayhost = [localhost]:2525
smtp_host_lookup = dns, native
inet_protocols = ipv4
```

save the file and run the following:

```bash
# Flush the queue
sudo postsuper -d ALL

# Restart Postfix
sudo postfix stop
sudo postfix start

# Make sure the SSH tunnel is still active
ps aux | grep "ssh -L"

# Check postfix status
sudo postfix status

# View detailed queue statistics
qshape

# View logs
sudo tail -f /var/log/mail.log

# If not reconnect
ssh -L 2525:localhost:25 root@asleepace.com

# Try sending an email again
echo "Test message" | mail -s "Test Subject" colin_teahan@yahoo.com
```

# `mailq` Commands

Below is a list of some helpful `mailq` commands.

```bash
# View mail queue (same as mailq)
postqueue -p

# Delete all messages from queue
sudo postsuper -d ALL

# Delete specific message by ID
sudo postsuper -d D4008202F6A04

# Hold message
sudo postsuper -h D4008202F6A04

# Release held message
sudo postsuper -H D4008202F6A04

# Requeue message (try sending again)
sudo postsuper -r D4008202F6A04

# Flush the queue (try sending all)
sudo postqueue -f

# Show queue size
mailq | grep -c "^[A-F0-9]"

# Clear deferred queue only
sudo postsuper -d ALL deferred
```

# DKIM and SPF

If you view the first [example](./examples.md) you should see the following in the raw message received by Yahoo:

```txt
X-Originating-Ip: [192.241.216.26]
Received-SPF: softfail (domain of transitioningasleepace.com does not designate 192.241.216.26 as permitted sender)
Authentication-Results: atlas116.free.mail.bf1.yahoo.com;
 dkim=unknown;
 spf=softfail smtp.mailfrom=asleepace.com arc_overridden_status=NOT_OVERRIDDEN;
 dmarc=unknown header.from=asleepace.com arc_overridden_status=NOT_OVERRIDDEN;
```

Since this message went to my spam folder, I asked Claude about these settings and this was the response:

> This raw email shows several important things about your email setup:
>
> 1.  SPF is showing a softfail: `spf=softfail (domain of transitioningasleepace.com does not designate 192.241.216.26 as permitted sender)`
>
> This means your Digital Ocean droplet's IP (192.241.216.26) isn't authorized in your domain's SPF record
>
> 2.  DKIM is unknown: `dkim=unknown`
>
> This indicates no DKIM signing is set up for your domain
>
> 3.  DMARC is also unknown: `dmarc=unknown`
>
> To improve your email deliverability and prevent your emails from potentially being marked as spam, you should:
>
> 1.  Add an SPF record for your domain that includes your Digital Ocean droplet's IP:
>
> ```
> v=spf1 ip4:192.241.216.26 -all
> ```
>
> 2.  Set up DKIM signing with Postfix
>
> 3.  Create a DMARC record

```

```
