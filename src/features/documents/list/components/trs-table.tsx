import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { DataTablePagination, DataTableToolbar } from '@/shared/data-table'
import { cn } from '@/shared/lib/utils'
import { useTableUrlState } from '@/shared/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import {
  chainRoleOptions,
  docTypeOptions,
  trNatures,
  trStatuses,
  trUnits,
} from '@/features/documents/data/data'
import { type TRItem } from '@/features/documents/data/schema'
import { TRsCard } from './trs-card'
import { trsColumns as columns } from './trs-columns'
import { TRsEmptyState } from './trs-empty-state'

const route = getRouteApi('/_authenticated/documentos/')

type TRsTableProps = {
  data: TRItem[]
}

export function TRsTable({ data }: TRsTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  // Natureza é filtrável "à parte" mas a coluna fica escondida por default
  // para não poluir a tabela. O usuário ativa via "Colunas" se quiser ver.
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    nature: false,
    chainRole: false,
  })

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      { columnId: 'docType', searchKey: 'docType', type: 'array' },
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'unit', searchKey: 'unit', type: 'array' },
      { columnId: 'nature', searchKey: 'nature', type: 'array' },
      { columnId: 'chainRole', searchKey: 'chainRole', type: 'array' },
    ],
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      return [row.original.id, row.original.title, row.original.owner].some(
        (field) => field.toLowerCase().includes(searchValue)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  const hasRows = table.getRowModel().rows.length > 0
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    Boolean(table.getState().globalFilter)

  if (!data.length) {
    return <TRsEmptyState />
  }

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filtrar por título, ID ou responsável…'
        filters={[
          {
            columnId: 'docType',
            title: 'Tipo',
            options: [...docTypeOptions],
          },
          {
            columnId: 'status',
            title: 'Status',
            options: [...trStatuses],
          },
          {
            columnId: 'unit',
            title: 'Unidade',
            options: [...trUnits],
          },
          {
            columnId: 'chainRole',
            title: 'Cadeia',
            options: [...chainRoleOptions],
          },
          {
            columnId: 'nature',
            title: 'Natureza da Contratação',
            options: [...trNatures],
          },
        ]}
      />
      {hasRows ? (
        <>
          {/* Desktop (lg+): tabela. Abaixo de lg: cards, sem rolagem horizontal. */}
          <div className='hidden overflow-x-auto rounded-md border lg:block'>
            <Table className='min-w-[1100px]'>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className={cn(
                          header.column.columnDef.meta?.className,
                          header.column.columnDef.meta?.thClassName
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          cell.column.columnDef.meta?.className,
                          cell.column.columnDef.meta?.tdClassName
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className='grid gap-3 lg:hidden'>
            {table.getRowModel().rows.map((row) => (
              <TRsCard key={row.id} row={row} />
            ))}
          </div>
          <DataTablePagination table={table} className='mt-auto' />
        </>
      ) : (
        <TRsEmptyState
          filtered={isFiltered}
          onClearFilters={() => table.resetColumnFilters()}
        />
      )}
    </div>
  )
}
