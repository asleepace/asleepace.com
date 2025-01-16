import { getProcessInfo } from '@/lib/api/getProcessInfo'
import { useEffect } from 'react'
import { useState } from 'react'
import DataTable from './DataTable'

type ProcessInfoColumns =
  | 'USER'
  | 'PID'
  | 'CPU'
  | 'MEM'
  | 'VSZ'
  | 'RSS'
  | 'TTY'
  | 'STAT'
  | 'STARTED'
  | 'TIME'
  | 'COMMAND'

type ProcessInfo = Record<ProcessInfoColumns, string>

type Props = {
  refreshInterval?: number
}

let cachedProcessInfo: ProcessInfo[] = []

/**
 * ## ProcessInfo
 *
 * Displays the process information for the current process.
 */
export function ProcessInfoWidget({ refreshInterval }: Props) {
  const [processInfo, setProcessInfo] =
    useState<ProcessInfo[]>(cachedProcessInfo)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onFetchData = () =>
      getProcessInfo()
        .then(setProcessInfo)
        .catch((error) => {
          console.error(error)
          setError(error)
        })

    onFetchData() // fetch once immediately

    const interval = setInterval(() => {
      onFetchData()
    }, refreshInterval ?? 5_000)
    return () => clearInterval(interval)
  }, [refreshInterval])

  if (error) return <div className="text-red-500">{error}</div>

  return <DataTable data={processInfo ?? []} />
}
