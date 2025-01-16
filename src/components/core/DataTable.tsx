import clsx from 'clsx'
import { memo, useMemo } from 'react'

type DataPrimitive = string | number | boolean | null | undefined

export type DataTableProps<T extends Record<string, DataPrimitive>> = {
  className?: string
  data: T[] | undefined
}

function DataTable<T extends Record<string, any>>({
  className,
  data,
}: DataTableProps<T>) {
  const columns = useMemo(() => {
    if (!data || !data.length) return []
    return Object.keys(data[0])
  }, [data])

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={String(`col-${column}`)}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data?.map((row) => (
          <DataRow key={String(`row-${row.PID}`)} data={row} />
        ))}
      </tbody>
    </table>
  )
}

const DataRow = memo(<T extends Record<string, any>>({ data }: { data: T }) => {
  return (
    <tr>
      {Object.values(data).map((value, row) => (
        <td key={`col-${data.PID}-${row}`}>{value}</td>
      ))}
    </tr>
  )
})

export default memo(DataTable)
