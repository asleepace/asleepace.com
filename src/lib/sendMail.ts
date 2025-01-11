import net from 'node:net'

type EmailOptions = {
  to: string
  from?: string
  subject?: string
  body?: string
}

type SMTPOptions = {
  host?: string
  port?: number
}

class SMTP {
  private client: net.Socket

  public isConnected: Promise<boolean>

  constructor({ host = 'localhost', port = 25 }: SMTPOptions = {}) {
    const client = net.createConnection({ port, host })
    this.isConnected = new Promise<boolean>((resolve, reject) => {
      client.on('error', (e) => reject(e))
      client.on('connect', () => resolve(true))
    })
    this.client = client
  }

  public async send(options: EmailOptions) {
    await this.isConnected

    const commands = [
      `HELO localhost\r\n`,
      `MAIL FROM:<${options.from}>\r\n`,
      `RCPT TO:<${options.to}>\r\n`,
      'DATA\r\n',
      `From: ${options.from}\r\n`,
      `To: ${options.to}\r\n`,
      `Subject: ${options.subject}\r\n`,
      '\r\n',
      `${options.body}\r\n`,
      '.\r\n',
      'QUIT\r\n',
    ]

    this.client.on('data', (data) => {
      console.log("stream:", data.toString())
    })

    return new Promise<boolean>((resolve, reject) => {
      for (const command of commands) {
        const didFlushSuccessfully = this.client.write(command, reject)
        if (!didFlushSuccessfully) {
          reject(new Error('Failed to flush command'))
        }
      }
    })
  }
}

export const sendMail = async (options: EmailOptions) => {
  const mail = new SMTP()
  const resp = await mail.send(options)
}
