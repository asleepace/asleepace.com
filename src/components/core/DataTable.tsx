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

//
// -------------------------- TYPES --------------------------
//

type DataPrimitive = string | number | boolean | Date

type DataRecord = {
  [key: string]: DataPrimitive
}

type KeyExtractor = (row: DataRecord) => string

export type DataTableProps<
  T extends DataRecord,
  K extends keyof T = keyof T
> = {
  data: T[]
  sortBy: K
  getKey: KeyExtractor
  className?: string
}

//
// -------------------------- HELPERS --------------------------
//

/**
 * ## sortData
 *
 * Sorts the data based on the sortBy column.
 */
function sortData<T extends DataRecord, K extends keyof T>(
  data: T[] = [],
  sortBy?: K,
  isAscending?: boolean
) {
  if (!sortBy || !data) return data
  console.log(
    '[DataTable] sorting by',
    `"${String(sortBy)}"`,
    isAscending ? 'ascending' : 'descending'
  )
  const sortedOutput = data.toSorted((a, b) => {
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
  console.log('[DataTable] sorted:', sortedOutput.length)
  return sortedOutput
}

/**
 * ## useSortedData
 *
 * A hook that returns the sorted data based on the sortBy column.
 */
function useSortedData<T extends DataRecord, K extends keyof T>(
  data: T[],
  sortBy: K,
  isAscending = true
) {
  const [isPending, startTransition] = useTransition()
  const [sortedData, setSortedData] = useState<T[]>(data)

  const initialSort = useMemo(() => {
    if (sortedData && sortedData.length) {
      return sortedData
    }
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
  }, [data?.length])

  return [sortedData.length ? sortedData : initialSort, isPending] as const
}

//
// -------------------------- COMPONENT --------------------------
//

/**
 * ## DataTable
 *
 * A table component that displays data in a tabular format, be sure to import
 * the css file `@/styles/data-table.css` to style the table.
 */
function DataTable<T extends DataRecord>({
  data = [],
  getKey,
  sortBy: sortByProp,
}: DataTableProps<T>) {
  const columns = useMemo(() => {
    if (!data || !data.length) return []
    return Object.keys(data[0])
  }, [data])

  // scroll to top when sorting
  const tableBodyRef = useRef<HTMLTableSectionElement>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // sorting logic
  const [isAscending, setIsAscending] = useState(false)
  const [sortBy, setSortBy] = useState<keyof T>(sortByProp)
  const [sortedData, _isPending] = useSortedData(data, sortBy, isAscending)
  const [activeColumnIndex, setActiveColumnIndex] = useState(0)

  // sort tablet by column when clicked
  const onClickSort = useCallback(
    (column: keyof T) => {
      setSortBy(column)
      setIsAscending(!isAscending)
      setActiveColumnIndex(columns.indexOf(String(column)))
      tableContainerRef.current?.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    },
    [sortBy, isAscending, columns, tableContainerRef]
  )

  // memoized data row rendering
  const TableBody = useCallback(() => {
    const tableKey = String(sortBy) + (isAscending ? 'asc' : 'desc')
    return (
      <Fragment key={tableKey}>
        <tbody ref={tableBodyRef}>
          {sortedData.map((row, index) => {
            // get unique row key which will look like `row:<PID>:${index}:col:${index}`
            const rowKey = `row:${getKey(row)}:${index}`

            // render each column in the row here
            const rowColumns = Object.values(row).map((col, index) => {
              const column = String(col)
              return (
                <Fragment key={`${rowKey}:col:${index}`}>
                  <td title={column} aria-label={column}>
                    {column}
                  </td>
                </Fragment>
              )
            })

            // render entire row with column here
            return (
              <Fragment key={rowKey}>
                <tr>{rowColumns}</tr>
              </Fragment>
            )
          })}
        </tbody>
      </Fragment>
    )
  }, [getKey, isAscending, sortBy, sortedData])

  return (
    <div
      ref={tableContainerRef}
      className="data-table-container scrollbar-none"
    >
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
                <strong onClick={() => onClickSort(columnTitle)}>
                  {columnTitle}
                </strong>
              </th>
            ))}
          </tr>
        </thead>
        <TableBody />
      </table>
    </div>
  )
}

export default memo(DataTable)
