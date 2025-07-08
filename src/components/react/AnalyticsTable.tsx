import type { AnalyticsData } from '@/db'
import { useEffect, useState } from 'react'
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

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
    accessorKey: 'method',
    header: 'Method',
  },
  {
    accessorKey: 'path',
    header: 'Path',
  },
  {
    accessorKey: 'status',
    header: 'Status',
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
  },
  {
    accessorKey: 'isExternal',
    header: 'External',
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
          table.getRowModel().rows.map((row, i) => (
            <TableRow
              className={cn('px-4 border-none', i % 2 === 0 ? 'bg-black/10' : 'bg-transparent')}
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))
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
