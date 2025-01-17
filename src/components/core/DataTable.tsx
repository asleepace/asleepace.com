import clsx from 'clsx'
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react'

type DataPrimitive = string | number | boolean | null | undefined
type DataRecord = Record<string, DataPrimitive>

export type DataTableProps<T extends DataRecord> = {
  sortBy?: keyof T
  className?: string
  data: T[] | undefined
}

/**
 * ## sortData
 *
 * Sorts the data based on the sortBy column.
 */
function sortData<T extends DataRecord>(
  data: T[],
  sortBy?: keyof T,
  isAscending = true
) {
  if (!sortBy || !data) return data
  return data.toSorted((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]

    if (aValue && bValue && isNaN(+aValue) && isNaN(+bValue)) {
      return isAscending
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue))
    } else {
      const diff = Number(aValue) - Number(bValue)
      return isAscending ? diff : -diff
    }
  })
}

/**
 * ## useSortedData
 *
 * A hook that returns the sorted data based on the sortBy column.
 */
function useSortedData<T extends DataRecord>(
  data: T[],
  sortBy?: keyof T,
  isAscending = true
) {
  const [isPending, startTransition] = useTransition()
  const [sortedData, setSortedData] = useState<T[]>(data)

  const initialSort = useMemo(() => {
    return sortData(data, sortBy, isAscending)
  }, [data, sortBy, isAscending])

  const sortWithTransition = useCallback(() => {
    startTransition(() => {
      const sorted = sortData(data, sortBy, isAscending)
      setSortedData(sorted)
    })
  }, [data, sortBy, isAscending])

  useEffect(() => {
    if (data?.length) {
      sortWithTransition()
    }
  }, [sortWithTransition])

  return [setSortedData?.length ? sortedData : initialSort, isPending] as const
}

/**
 * ## getKey
 *
 * A function that returns a unique key for a row and column.
 */
const getKey = <T extends DataRecord>(row: T, column: keyof T) =>
  `row${row.PID}col${String(column)}`

/**
 * ## DataTable
 *
 * A table component that displays data in a tabular format, be sure to import
 * the css file `@/styles/data-table.css` to style the table.
 */
function DataTable<T extends DataRecord>({ data = [] }: DataTableProps<T>) {
  const columns = useMemo(() => {
    if (!data || !data.length) return []
    return Object.keys(data[0])
  }, [data])

  // scroll to top when sorting
  const tableBodyRef = useRef<HTMLTableSectionElement>(null)

  // sorting logic
  const [isAscending, setIsAscending] = useState(false)
  const [sortBy, setSortBy] = useState<keyof T>('PID')
  const [sortedData, isPending] = useSortedData(data, sortBy, isAscending)
  const [activeColumnIndex, setActiveColumnIndex] = useState(0)

  // sort tablet by column when clicked
  const onClickSort = useCallback(
    (column: keyof T) => {
      if (sortBy === column) {
        setIsAscending(!isAscending)
        setActiveColumnIndex(columns.indexOf(String(column)))
      } else {
        setSortBy(column)
        setActiveColumnIndex(columns.indexOf(String(column)))
      }
      tableBodyRef.current?.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    },
    [sortBy, isAscending, columns]
  )

  // memoized data column rendering
  const DataColumn = useCallback(
    (value: DataPrimitive, index: number, rowData: DataPrimitive[]) => {
      return (
        <Fragment key={`row${rowData[1]}col${index}`}>
          <td>{value}</td>
        </Fragment>
      )
    },
    [activeColumnIndex]
  )

  return (
    <div className="data-table-container scrollbar-none">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((columnTitle, columnIndex) => (
              <th
                key={columnTitle}
                className={clsx(
                  'font-bold hover:bg-indigo-500',
                  columnIndex === activeColumnIndex && 'bg-indigo-500'
                )}
              >
                <strong
                  className={
                    isPending
                      ? 'animate-pulse transition-transform to-orange-400'
                      : 'animate-none'
                  }
                  onClick={() => onClickSort(columnTitle)}
                >
                  {columnTitle}
                </strong>
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={tableBodyRef}>
          {sortedData.map((rowData) => (
            <Fragment key={getKey(rowData, sortBy)}>
              <tr>{Object.values(rowData).map(DataColumn)}</tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default memo(DataTable)
