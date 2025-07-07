# SMTP

This is a guide for settings up an SMTP server using Postfix, as well as how to connect to it from your local machine. You can also view some [example](./examples.md) of what the actual message looks like once they are sent. The preferred method is to use the `telnet` command to send the message from your local machine.

## Quick Start

```bash
# Send an email
echo "Test message" | mail -s "Test Subject" colin_teahan@yahoo.com

# Email logs
sudo tail -f /var/log/mail.log

# Open interactive terminal
telnet localhost 25   # (remote server)
telnet localhost 2525 # (local comp)

# Check the mail queue
mailq

# View mail logs for user "mailgod
sudo -u mailgod mail

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

Following up here are the instructions Claude suggested for Digital Ocean.

```bash
# Set up DKIM. Install the required packages:
sudo apt-get update
sudo apt-get install opendkim opendkim-tools postfix-policyd-spf-python

# Configure OpenDKIM. Edit /etc/opendkim.conf
sudo nano /etc/opendkim.conf

# Modify these lines:
Domain                  asleepace.com
KeyFile                 /etc/opendkim/keys/asleepace.com/mail.private
Selector                mail
Socket                  inet:12301@localhost

# Create directories and generate DKIM key:
sudo mkdir -p /etc/opendkim/keys/asleepace.com
cd /etc/opendkim/keys/asleepace.com
sudo opendkim-genkey -s mail -d asleepace.com
sudo chown -R opendkim:opendkim /etc/opendkim/keys

# Get your DKIM public record. Run:
sudo cat mail.txt

# Add the following DNS records to your domain (through your DNS provider)
#
# SPF Record (TXT record for @)
# v=spf1 ip4:192.241.216.26 -all

# DKIM Record (TXT record for mail._domainkey)
# [Content from mail.txt file]

# DMARC Record (TXT record for _dmarc)
# v=DMARC1; p=reject; rua=mailto:colin@asleepace.com


# Configure Postfix to use DKIM. Edit /etc/postfix/main.cf:
sudo nano /etc/postfix/main.cf
```

Add the following to `/etc/postfix/main.cf`

```conf
# DKIM
milter_protocol = 2
milter_default_action = accept
smtpd_milters = inet:localhost:12301
non_smtpd_milters = inet:localhost:12301

# SPF
policy-spf_time_limit = 3600s
smtpd_recipient_restrictions = permit_mynetworks,permit_sasl_authenticated,reject_unauth_destination,check_policy_service unix:private/policy-spf
```

Then back in the terminal run the following:

```bash
sudo nano /etc/postfix-policyd-spf-python/policyd-spf.conf
```

Add the following to the to `/etc/postfix-policyd-spf-python/policyd-spf.conf`

```conf
# policyd-spf.conf
debugLevel = 1
defaultSeedOnly = 1
HELO_reject = False
mail_from_reject = False
```

Then run the following:

```bash
sudo systemctl restart postfix
sudo systemctl restart postfix-policyd-spf-python
```

## Testing

To test the DKIM and SPF settings you can use the following command:

```bash
# Test DKIM signing
opendkim-testkey -d asleepace.com -s mail -vvv

# Test SPF
dig TXT asleepace.com

# Test DMARC
dig TXT _dmarc.asleepace.com
```

After setting this up, wait a bit for DNS propagation (can take up to 24-48 hours). You can monitor propagation using:

```bash
dig TXT asleepace.com
dig TXT mail._domainkey.asleepace.com
dig TXT _dmarc.asleepace.com
```

### Troubleshooting

For the Yahoo rejection:

This is likely because your IP is new and hasn't established a reputation
You may need to:

1. Gradually send emails
2. Use a reputable email service
3. Set up proper reverse DNS (PTR record)
4. Configure SPF and DMARC in addition to DKIM

### References

Example message send via telnet `telnet localhost 25`

```txt
EHLO localhost
MAIL FROM: <root@asleepace.com>
RCPT TO: <colin_teahan@yahoo.com>
DATA
From: root@asleepace.com
To: colin_teahan@yahoo.com
Subject: DKIM Test Almost Working

This is a DKIM test email.

.
QUIT
```
