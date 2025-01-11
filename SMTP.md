# SMTP

This is a guide for settings up an SMTP server using Postfix, as well as how to connect to it from your local machine.

## Quick Start

```bash
# Send an email
echo "Test message" | mail -s "Test Subject" colin_teahan@yahoo.com

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