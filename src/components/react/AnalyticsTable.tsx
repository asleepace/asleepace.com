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
        <div className={cn('ps-2 text-center shrink flex', isOk ? 'text-green-500' : 'text-red-500')}>
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
    accessorKey: 'ipAddress',
    header: 'IP',
    cell: ({ row }) => {
      const ipAddress: string = row.getValue('ipAddress') ?? '---'
      const isPresent = ipAddress !== '---'
      return (
        <div className={cn('font-mono', isPresent ? 'text-orange-400' : 'text-neutral-400')}>
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
      const region = headers['X-Region'] ?? 'N/A'
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
      const city = headers['X-City'] ?? 'N/A'
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
    cell: ({ row }) => {
      const trackingId: string = row.getValue('trackingId') ?? '---'
      const isPresent = trackingId !== '---'
      return <div className="font-mono text-neutral-400">{trackingId ?? '---'}</div>
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
