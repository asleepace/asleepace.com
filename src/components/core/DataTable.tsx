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

  console.log(columns)

  return (
    <table className={clsx('min-h-96 overflow-auto', className)}>
      <thead>
        <tr className="bg-blue-600 text-white">
          {columns.map((column) => (
            <th className="resize-x overflow-auto" key={column}>
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data?.map((row, index) => (
          <DataRow key={index} data={row} column={index} />
        ))}
      </tbody>
    </table>
  )
}

const DataRow = memo(
  <T extends Record<string, any>>({
    data,
    column,
  }: {
    data: T
    column: number
  }) => {
    return (
      <tr>
        {Object.values(data).map((value, row) => (
          <td className="resize overflow-auto" key={`${column}-${row}`}>
            {value}
          </td>
        ))}
      </tr>
    )
  }
)

export default memo(DataTable)
