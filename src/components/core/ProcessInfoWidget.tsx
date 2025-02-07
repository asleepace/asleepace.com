import { fetchProcessInfo } from '@/lib/frontend/fetchProcessInfo'
import { useEffect } from 'react'
import { useState } from 'react'
import DataTable from './DataTable'
import type { ProcessInfo } from '@/lib/linux/getProcessInfo'

type Props = {
  refreshInterval?: number
}

/**
 * ## getKey(row)
 *
 * Helper method for extracting a unique key for each row from it's PID
 * number which is unique per process.
 *
 */
const getKey = ({ PID }: ProcessInfo) => PID.toString()

/**
 * ## ProcessInfoWidget
 *
 * Displays the process information for the current process.
 *
 */
export function ProcessInfoWidget({ refreshInterval }: Props) {
  const [processInfo, setProcessInfo] = useState<ProcessInfo[]>([])
  const [error, setError] = useState<string | undefined>()

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
