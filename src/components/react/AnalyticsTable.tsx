import type { AnalyticsData } from '@/db'
import { useEffect, useState } from 'react'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type Row,
  type RowData,
  useReactTable,
} from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/utils/cn'

async function fetchAnalytics() {
  const response = await fetch('/api/analytics', {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-Type': 'aplication/json',
    },
  })
  console.log('[fetchAnalytics] fetchAnalytics:', response)
  const data = await response.json()
  return data as AnalyticsData[]
}

// https://ui.shadcn.com/docs/components/data-table

function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  useEffect(() => {
    fetchAnalytics()
      .then((data) => setAnalytics(data))
      .catch((err) => {
        console.warn('[useAnalytics] error:', err)
      })
  }, [])
  return analytics
}

const columns: ColumnDef<AnalyticsData>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const statusText: string = row.getValue('status') ?? '-1'
      const status = Number(statusText)
      const isOk = status >= 200 && status < 300
      return (
        <div className={cn(isOk ? 'text-green-500' : 'text-red-500')}>
          <span>{statusText}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'method',
    header: 'Method',
  },
  {
    accessorKey: 'path',
    header: 'Path',
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP',
  },
  {
    accessorKey: 'country',
    header: 'Country',
  },
  {
    accessorKey: 'isBot',
    header: 'Bot',
    cell: ({ row }) => {
      const isBot = !!row.getValue('isBot')
      return (
        <div className={cn('font-mono', isBot ? 'text-orange-400' : 'text-neutral-400')}>
          <span>{isBot ? 'true' : 'false'}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'isExternal',
    header: 'External',
    cell: ({ row }) => {
      const isExternal = !!row.getValue('isExternal')
      return (
        <div className={cn('font-mono', isExternal ? 'text-orange-400' : 'text-neutral-400')}>
          <span>{isExternal ? 'true' : 'false'}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'trackingId',
    header: 'Tracking',
  },
]

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

function AnalyticsRow({ row, index }: { row: Row<any>; index: number }) {
  const isEvenRow = index % 2 === 0
  return (
    <TableRow
      className={cn(
        'px-4 border-none hover:bg-white/10 data-[state=selected]:bg-white/20',
        isEvenRow ? 'bg-black/10' : 'bg-transparent'
      )}
      key={row.id}
      data-state={row.getIsSelected() && 'selected'}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table className="border-none px-8">
      <TableHeader className="bg-blue-500 border-none shadow-lg sticky top-0">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow className="sticky top-0 border-none" key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead className="font-semibold font-mono text-white text-shadow-2xs" key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row, index) => <AnalyticsRow row={row} index={index} />)
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

export function AnalyticsTable() {
  const data = useAnalytics()
  return <DataTable columns={columns} data={data} />
}
