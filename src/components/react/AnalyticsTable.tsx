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
    cache: 'no-store',
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  })
  if (!response.ok) {
    console.warn(`[AnalyticsTable] failed to fetch analytics data:`, response.status, response.statusText)
    throw new Error('Failed to fetch analytics data')
  }
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
      const isRedirected = status >= 300 && status < 400
      const isClientError = status >= 400 && status < 500
      return (
        <div
          className={cn(
            'ps-2 text-center shrink flex',
            isOk
              ? 'text-green-500'
              : isRedirected
              ? 'text-yellow-500'
              : isClientError
              ? 'text-orange-500'
              : 'text-red-500'
          )}
        >
          <span>{statusText}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'method',
    header: 'Method',
    cell: ({ row }) => {
      const method: string = row.getValue('method') ?? 'GET'
      return (
        <div className="font-semibold tracking-wider text-neutral-500">
          <span>{method}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'path',
    header: 'Path',
    cell: ({ row }) => {
      const path: string = row.getValue('path')
      return (
        <div>
          <a className="text-blue-300 font-mono" href={path}>
            {path}
          </a>
        </div>
      )
    },
  },
  {
    accessorKey: 'ip_address',
    header: 'IP',
    cell: ({ row }) => {
      const ipAddress: string = row.getValue('ip_address') ?? '---'
      const isPresent = ipAddress !== '---'
      return (
        <div className={cn('font-mono', isPresent ? 'text-indigo-400' : 'text-neutral-600')}>
          <span>{ipAddress}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'country',
    header: 'Country',
    cell: ({ row }) => {
      const country: string = row.getValue('country') ?? 'N/A'
      const isPresent = country !== 'N/A'
      return (
        <div className={cn('font-mono', isPresent ? 'text-orange-400' : 'text-neutral-400')}>
          <span>{country}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'region',
    header: 'Region',
    cell: ({ row }) => {
      const headers: AnalyticsData['headers'] = row.getValue('headers') ?? {}
      const region = headers['X-Region'] ?? headers['x-region'] ?? 'N/A'
      const isPresent = region !== 'N/A'
      return (
        <div className={cn('font-mono', isPresent ? 'text-orange-400' : 'text-neutral-400')}>
          <span>{region}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'city',
    header: 'City',
    cell: ({ row }) => {
      const headers: AnalyticsData['headers'] = row.getValue('headers') ?? {}
      const city = headers['X-City'] ?? headers['x-city'] ?? 'N/A'
      const isPresent = city !== 'N/A'
      return (
        <div className={cn('font-mono', isPresent ? 'text-orange-400' : 'text-neutral-400')}>
          <span>{city}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'isBot',
    header: 'Bot',
    cell: ({ row }) => {
      const isBot = Boolean(row.getValue('isBot'))
      return (
        <div className={cn('font-mono', isBot ? 'text-orange-400' : 'text-neutral-400')}>
          <span>{isBot ? 'true' : 'false'}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'is_external',
    header: 'External',
    cell: ({ row }) => {
      const isExternal = !!row.getValue('is_external')
      return (
        <div className={cn('font-mono', isExternal ? 'text-orange-400' : 'text-neutral-400')}>
          <span>{isExternal ? 'true' : 'false'}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'tracking_id',
    header: 'Tracking',
    cell: ({ row }) => {
      const trackingId: string = row.getValue('tracking_id') ?? '---'
      const isPresent = trackingId !== '---'
      return <div className="font-mono text-neutral-600">{trackingId ?? '---'}</div>
    },
  },
  {
    accessorKey: 'headers',
    header: 'Headers',
    cell: ({ row }) => {
      const headers = JSON.stringify(row.getValue('headers') ?? {})
      const headerLength = headers.length
      return <div className="text-ellipsis overflow-hidden text-neutral-400">{headerLength} bytes</div>
    },
  },
]

function AnalyticsRow({ row, index }: { row: Row<any>; index: number }) {
  const isEvenRow = index % 2 === 0
  return (
    <TableRow
      className={cn(
        'px-4 border-none hover:bg-white/10 data-[state=selected]:bg-white/20',
        isEvenRow ? 'bg-black/10' : 'bg-transparent'
      )}
      key={row.id}
      data-state={row.getIsSelected() ? 'selected' : undefined}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
      ))}
    </TableRow>
  )
}

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
    <Table className="border-none">
      <TableHeader  className="bg-blue-500 border-none shadow-lg sticky! top-0 z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow className="border-none" key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead className="font-semibold font-mono text-white text-shadow-2xs" key={header.id}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
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
  return (
    <div className="h-full overflow-auto">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
