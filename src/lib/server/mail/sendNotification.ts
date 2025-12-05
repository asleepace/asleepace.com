export interface Notification<T extends {} = {}> {
  type: string
  message: string
  data?: T
}

export type EmailNotificationParams = {
  to?: string
  from?: string
  name?: string
  subject?: string
  message: string
}

/*
Example Bash:

echo "Testing" | mail -s "Notification" \
  -a "From: Asleepace Notifications <notifications@asleepace.com>" \
  -a "Reply-To: notifications@asleepace.com" \
  "colin_teahan@hotmail.com"
*/

/**
 * Send a simple email notification which can be further configured, the default recipient is my
 * yahoo email address.
 * ```ts
 * // basic usage
 * sendEmailNotification({ message: "Hello, world!" })
 *
 * // custom subject & message
 * sendEmailNotification({
 *    subject: "Deployment Finished",
 *    message: "Commit #123123"
 * })
 *
 * // advanced customization
 * sendEmailNotification({
 *    to: "colin@asleepace.com",
 *    from: "notifications@asleepace.com",
 *    name: "Asleepace Deployments",
 *    subject: "Deployment Finished",
 *    message: "Commit #123123"
 * })
 * ```
 */
export async function sendEmailNotification({
  to: toEmail = 'colin_teahan@yahoo.com',
  from: fromEmail = 'notifications@asleepace.com',
  name = 'Asleepace Notification',
  subject = 'Notifcation',
  message,
}: EmailNotificationParams) {
  try {
    const proc = Bun.spawn({
      cmd: [
        'mail',
        '-s',
        subject,
        fromEmail,
        '-a',
        `From: ${name} <${fromEmail}>`,
        '-a',
        `Reply-To: ${fromEmail}`,
        toEmail,
      ],
      stdin: 'pipe',
      stdout: 'ignore',
      stderr: 'pipe',
    })

    if (proc.stdin) {
      proc.stdin.write(message)
      proc.stdin.end()
    }

    await proc.exited
  } catch (err) {
    console.warn('[sendEmailNotificaiton] error:', err)
  } finally {
    console.log('[sendEmailNotificaiton] finished!')
  }
}
