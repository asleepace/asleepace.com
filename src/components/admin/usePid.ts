import { useCallback, useEffect, useState } from 'react'

const PID_HEADER = 'x-shell-pid'

const fetchProcessPid = async () => {
  const resp = await fetch('/api/shell/stream', {
    method: 'HEAD',
    credentials: 'include',
  })
  console.log('[fetchProcessPid] status:', resp.status)
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
export function usePid() {
  const [pid, setPid] = useState<number | undefined>(undefined)

  const onStartPid = useCallback(
    () =>
      fetchProcessPid()
        .then((nextPid) => {
          console.log('[usePid] new pid:', nextPid)
          setPid(nextPid)
          return nextPid
        })
        .catch((err) => {
          console.error('[usePid] error:', err)
          setPid(undefined)
        }),
    []
  )

  const onResetPid = useCallback(() => {
    console.warn('[usePid] resetting!')
    setPid(undefined)
  }, [])

  return [pid, onStartPid, onResetPid] as const
}
