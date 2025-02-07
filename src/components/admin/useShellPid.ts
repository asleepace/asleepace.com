import { useCallback, useEffect, useState } from 'react'

const PID_HEADER = 'x-shell-pid'

const fetchProcessPid = async () => {
  const resp = await fetch('/api/shell/stream', {
    method: 'HEAD',
    credentials: 'include',
  })
  const pid = Number(resp.headers.get(PID_HEADER))
  return pid
}

/**
 * ## useShellPid()
 *
 * This hook returns the current shell pid, if no pid is found it will fetch
 * a new one from the server.
 *
 * Also returns a function to clear the PID and fetch a new one.
 *
 */
export function useShellPid() {
  const [pid, setPid] = useState<number | undefined>(undefined)

  useEffect(() => {
    fetchProcessPid()
      .then((nextPid) => setPid(nextPid))
      .catch((err) => {
        console.error('[useShellPid] error:', err)
        setPid(undefined)
      })
  }, [pid])

  const onResetPid = useCallback(() => {
    console.log('[onResetPid] resetting pid')
    setPid(undefined)
  }, [])

  return [pid, onResetPid] as const
}
