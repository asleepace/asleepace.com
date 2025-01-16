import clsx from 'clsx'
import { useEffect, useState } from 'react'

type MemoryUsageColumn =
  | 'USER'
  | 'PID'
  | 'CPU'
  | 'MEM'
  | 'VSZ'
  | 'RSS'
  | 'TT'
  | 'STAT'
  | 'STARTED'
  | 'TIME'
  | 'COMMAND'

type MemoryUsage = Record<MemoryUsageColumn, string>

const SampleData: MemoryUsage[] = [
  {
    USER: 'root',
    PID: '1',
    CPU: '0.0',
    MEM: '8.0',
    VSZ: '0.0',
    RSS: '0.0',
    TT: '0.0',
    STAT: '0.0',
    STARTED: '0.0',
    TIME: '0.0',
    COMMAND: '0.0',
  },
  {
    USER: 'user',
    PID: '2',
    CPU: '19.0',
    MEM: '0.0',
    VSZ: '0.0',
    RSS: '0.0',
    TT: '0.0',
    STAT: '0.0',
    STARTED: '0.0',
    TIME: '0.0',
    COMMAND: '0.0',
  },
]

export function MemoryUsageTable() {
  const [memoryUsage, setMemoryUsage] = useState<MemoryUsage[]>(SampleData)

  const columns = Object.keys(memoryUsage[0])

  useEffect(() => {
    fetch('/api/system/info', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => setMemoryUsage(data))
      .catch((error) => console.error(error))
  }, [])

  return (
    <div className="flex flex-col flex-1 self-stretch min-h-[400px] w-full max-w-screen-lg">
      <div className="sticky top-0 left-0 right-0 flex flex-row justify-between align-center px-4 py-3 text-white bg-blue-700 font-thin">
        {columns.map((column) => (
          <p className="text-sm flex-1 max-w-16 text-ellipsis flex truncate font-black">
            {column}
          </p>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {memoryUsage.map((usage, index) => (
          <MemoryRow key={usage.PID} {...usage} index={index} />
        ))}
      </div>
    </div>
  )
}

function MemoryRow(props: MemoryUsage & { index: number }) {
  const values = Object.values(props)

  return (
    <div
      className={clsx(
        'flex flex-row justify-between align-center p-2 text-white px-4 scrollbar-track-transparent scrollbar-thumb-zinc-700',
        props.index % 2 === 0 ? 'bg-transparent' : 'bg-zinc-800'
      )}
    >
      {values.map((data) => (
        <p className="text-xs flex-1 truncate font-mono font-light text-ellipsis max-w-16">
          {data}
        </p>
      ))}
    </div>
  )
}
