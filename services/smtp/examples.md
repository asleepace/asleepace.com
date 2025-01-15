# Examples

### Example - Telnet to Yahoo

The following was sent using `sudo telnet localhost 25` on my Digital Ocean droplet, and then entering the following lines one by one:

```bash
# on digital ocean droplet
sudo telnet localhost 25

# inside telnet interactive shell
HELO localhost
MAIL FROM: sender@example.com
RCPT TO: recipient@example.com
DATA
Subject: Test Subject
From: sender@example.com
To: recipient@example.com

This is the body of your email.
.
QUIT
```

This generated the following output which did include the proper sender and recipient, but also showed up in my Yahoo spam folder.

```txt
Received: from 10.197.40.73
 by atlas116.free.mail.bf1.yahoo.com pod-id NONE with HTTPS; Mon, 13 Jan 2025 21:33:46 +0000
Return-Path: <colin@asleepace.com>
X-Originating-Ip: [192.241.216.26]
Received-SPF: softfail (domain of transitioningasleepace.com does not designate 192.241.216.26 as permitted sender)
Authentication-Results: atlas116.free.mail.bf1.yahoo.com;
 dkim=unknown;
 spf=softfail smtp.mailfrom=asleepace.com arc_overridden_status=NOT_OVERRIDDEN;
 dmarc=unknown header.from=asleepace.com arc_overridden_status=NOT_OVERRIDDEN;
X-Apparently-To: colin_teahan@yahoo.com; Mon, 13 Jan 2025 21:33:46 +0000
X-YMailISG: DuCbV2wWLDsvPaZnyQA5VXOpXLNkyDRhCwk1eNh0zmUfpssx
 3djjI9LawcBzWLREUxXV8YzbyCOliYZRTVPFnpcdMfEBQWAWq0XZDCYmUGkl
 Z3JxZ3xzA.pqZGEcndKqadL5ORu2xZKNQp18vm1KNBk5HjP085qaYPW8z1be
 vNYzGK9Dt5FfN1D5keAC8iflgZSoBgs37_ulKudISCUn31bKE44.VOft4VVH
 x4ql.v5RJWhufnj72sWfMmGKtwEqgAfnEKP.8gtE4jn8JvTfIeDyhcd76bsv
 XBmMvBHWPRcIAFH6bfyoNY_8c8bx1fATEVXAH9L8IyXA.mhw7NB5.GJIHnx9
 gHZL1p_VwVo7yryUIgNJltXwZUqibZmd803uJlTn0Ed5bOHZenSV_pqXiDXd
 WUgYWkBYVfzGDGQ8d1L0XnnUlSyKzEm6LjYMo62M5qkWrfbYouxq53eQNCY5
 BL5ASwaZqzQyaITgWTSqIjb6rUyt9CEnDcq2I1f1BYwU1XBQSqo8GjSjnn8N
 puktwO79aVUqF7wwei6fy2XxrcfYbnaYPCVDwq_HVxBU4Lct8RX86TcZRNkB
 gzaPR3ZfWlNMo0HgHk8Pvpj7fqfaX8GUmejfg7P7R7qMoqKnZ7JupX76TsQ2
 uOBtc3sVxsy7fTDCenEuHue8aK2mN5tFVZpiJz7Ou7NGO.bKkB8aas4TQNQb
 2qMz9lI_0XHCQsht9DpzvB85raAXuWuYc2a0K1Dr7NxE1KteXpnm8bov8Yxh
 tbRx8zGJ6DR8kl99cij4y1UwuadZmj3JJU0eWP5pf0Ia1a6z4vYMp4mABWOa
 ety0Jy5IFYs0hfFTs_.lAK1g4BHSgOxxR6nqWtrnT8rXH2YY9vgfYY6K9nhJ
 Cr7oPxAELagWZdL3NKhTQZn1HHzXe6HswKoeHbcxcDxFIkD1X6F8NJ0iEjDv
 kuB1QkXKvkqh6s5Be64tBIOsOPRoJAPcKUUPorNb7leBC2k2.lF7LEewcE2j
 otQBR.ObFKPqEzM8CoEp77Q5lhGMd.nSjKFdKGncf07kKir8nMWM4ArHbcQM
 NG5tqsDfQ8Ye9nCk.9x3_7pJMnpzu6ghTCFdMX8qvHG_cVv3fQ--
Received: from 192.241.216.26 (EHLO asleepace-droplet)
 by 10.197.40.73 with SMTPs
 (version=TLS1_3 cipher=TLS_AES_128_GCM_SHA256);
 Mon, 13 Jan 2025 21:33:46 +0000
Received: from localhost (localhost [IPv6:::1])
	by asleepace-droplet (Postfix) with SMTP id 294CE5ADD5
	for <colin_teahan@yahoo.com>; Mon, 13 Jan 2025 21:32:09 +0000 (UTC)
Subject: SMTP Test Interactive Shell
From: colin@asleepace.com
To: colin_teahan@yahoo.com
Message-Id: <20250113213226.294CE5ADD5@asleepace-droplet>
Date: Mon, 13 Jan 2025 21:32:09 +0000 (UTC)
Content-Length: 102

This was sent using the interactive shell on my digital ocean droplet via "sudo telnet localhost 25".
```

### Example - Single line CLI to Yahoo

The following is an example of a single line CLI command to send an email to Yahoo, it showed up as `root` as the sender since it seems the receipt also needs to be added to the body of the email. Showed up in my Yahoo spam folder as well.

```bash
# cli command which generates the following output, sent via my digital ocean droplet
echo -e "Subject: SMTP Test\n\nThis is a test send from the CLI" | sendmail -f colin@asleepace.com colin_teahan@yahoo.com
```

Raw message received by Yahoo:

```txt
Received: from 127.0.0.1
 by atlas-production.v2-mail-prod1-gq1.omega.yahoo.com pod-id atlas--production-gq1-5475dd46b-rf9wq.gq1.yahoo.com with HTTP; Mon, 13 Jan 2025 21:23:57 +0000
Return-Path: <colin@asleepace.com>
X-Originating-Ip: [192.241.216.26]
Received-SPF: softfail (domain of transitioningasleepace.com does not designate 192.241.216.26 as permitted sender)
Authentication-Results: atlas-production.v2-mail-prod1-gq1.omega.yahoo.com;
 dkim=unknown;
 spf=softfail smtp.mailfrom=asleepace.com arc_overridden_status=NOT_OVERRIDDEN;
 dmarc=unknown header.from=asleepace.com arc_overridden_status=NOT_OVERRIDDEN;
X-Apparently-To: colin_teahan@yahoo.com; Mon, 13 Jan 2025 21:23:57 +0000
X-YMailISG: 9yFcufEWLDufFIChsC47vF.G3OmHxyhd1KSjQTgzu3ixBbR0
 Ysy3_DAHCrKTRSerdIO3TXvECLy0W1IGWhxssCdAoz27IZfLdZedZ.m31SoF
 uEKdDbhccAQS6a_MROT.KieppQO0BQEotT3Yoxuw_i6MRR4EiCVCpeO7EUyL
 885coWepdxKGt9QtuzMLnK8ksueKy.bvtwk7uDJQJO_XBf6y7lgvoG.y8LPG
 AG0NqKlG6Fu2Z_3.gjbaiBFJTZtYacAypjgjlw5QspWIIqz_QRW3L4ZzcDoq
 N5BEVNRvUoiUPKmW_tfkLY_7ota5gxjkX8E6A1t75gMEYX9bFZxrcshTZxpa
 t9L9MV0x.qOM93MoarhCRiTarg8TQ9FFtqmKOzpysK3ZlLkY3Nb8Ybg3GyUE
 veo6HVpi8c_znO.vmduLtyRKqEUIq8uvwO.ueIt4ZaleLnSjMrzK3h9EqR..
 R3jTT8b3oNDkJKZ_9uyXIKq3qk7KIXwtdnDv6a.7StWGTua2jno.rvkonAP8
 YSeCN4OXs9Imxtc9eXJJB9sTlMCjWyPdmRaxwERGdVyRNtEQwfeWu6uKLQvg
 ARdne0xFqv341N6BZjrUqMPxAVJXZFbOJ1IR2AXCFk33J0Cs8OHXe80GLd7b
 Rr_k0ilWgxLigZB.Rz_SrgkIrxk8tn_Yd6ojABBD48cXR6jiskI8_Nh.Mzq3
 tEtoGqgv4GZlmMdbmoCy14XTaL3PUssszwg8Lwuc1b_P.wfv.cN.CodgSL2_
 dikGUxoYUJQSS8ynhEepLh_CwbVy0NeKvF_dvHwSy.7lt_gKx1eGQLXguSLl
 e_UqSrDLO5_dZG3L6g1A8JzTL0IGZIC8nk.aVqEYWFkVyk7eMJWbF_b0WPAh
 9ja2KRH67j5uJyENrkuEECi1NIsCsDhfPvParzYIzfCU2pqXZi26GjZUjlID
 fPjSYT0_p6w5YCALtOHysP8W6h8Qb9JVzCKqRJMf8XKjNSr6Yi3s.wDhUF2l
 rZ..NcvjnHg1lu6TUuQyE1B16W30URsmxatBUB4NJdnvkqj_QHEaPxz360VD
 opcFQQkx_7mANFrbV_LcTNA23GXrfSj__1G7kWE0watNPok3N_56OlIZtH6a
 G7yfIn9yin1nsNd.81jDDtsD9g--
Received: from 192.241.216.26 (EHLO asleepace-droplet)
 by 10.253.233.86 with SMTPs
 (version=TLS1_3 cipher=TLS_AES_128_GCM_SHA256);
 Mon, 13 Jan 2025 21:23:57 +0000
Received: by asleepace-droplet (Postfix, from userid 0)
	id E6B4E5ADD9; Mon, 13 Jan 2025 21:23:56 +0000 (UTC)
Subject: SMTP Test
Message-Id: <20250113212356.E6B4E5ADD9@asleepace-droplet>
Date: Mon, 13 Jan 2025 21:23:56 +0000 (UTC)
From: root <colin@asleepace.com>
Content-Length: 33

This is a test send from the CLI
```
