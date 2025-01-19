import { fetchProcessInfo } from '@/lib/api/fetchProcessInfo'
import { useCallback, useEffect } from 'react'
import { useState } from 'react'
import DataTable from './DataTable'
import type { ProcessInfo } from '@/pages/api/system/info'

type Props = {
  refreshInterval?: number
}

/**
 * ## ProcessInfo
 *
 * Displays the process information for the current process.
 */
export function ProcessInfoWidget({ refreshInterval }: Props) {
  const [processInfo, setProcessInfo] = useState<ProcessInfo[]>([])
  const [error, setError] = useState<string | undefined>()

  const getKey = useCallback((row: ProcessInfo) => row.PID.toString(), [])

  useEffect(() => {
    const onFetchData = () =>
      fetchProcessInfo()
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

  return <DataTable sortBy="PID" getKey={getKey} data={processInfo} />
}
