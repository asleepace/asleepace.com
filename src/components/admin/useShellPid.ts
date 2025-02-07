import { useEffect, useState } from 'react'

/**
 * ## useShellPid()
 *
 * This hook returns the current shell pid, if no pid is found it will fetch
 * a new one from the server.
 *
 */
export function useShellPid() {
  const [pid, setPid] = useState<number | undefined>(undefined)
  console.log('[useShellPid] pid:', pid)

  useEffect(() => {
    fetch('/api/shell/stream', { method: 'HEAD' })
      .then((resp) => {
        console.log('[useShellPid] resp:', resp)

        const pid = resp.headers.get('x-shell-pid')
        const pidNumber = Number(pid)
        console.log('[useShellPid] pid header:', pid)

        if (!pid) throw new Error('No pid found')
        if (isNaN(pidNumber) || pidNumber <= 0) throw new Error('Invalid pid')

        setPid(pidNumber)
      })
      .catch((err) => {
        console.error('[useShellPid] error:', err)
      })
  }, [])

  return pid
}
