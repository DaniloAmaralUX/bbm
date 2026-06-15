import { Link } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/shared/data-table'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { chainRole, chainRoleLabels } from '@/features/documents/data/chain'
import {
  trNatureLabels,
  trStatusBadgeClass,
  trStatusLabels,
} from '@/features/documents/data/data'
import { docTypeLabel } from '@/features/documents/data/doc-type'
import { type TRItem } from '@/features/documents/data/schema'
import { TRsRowActions } from './trs-row-actions'

export const trsColumns: ColumnDef<TRItem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Selecionar tudo'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Selecionar ${row.original.id}`}
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => (
      <Link
        to='/documentos/$documentoId'
        params={{ documentoId: row.original.id }}
        className='font-mono text-sm font-medium text-primary underline-offset-4 hover:underline'
      >
        {row.getValue('id')}
      </Link>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'docType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    meta: { title: 'Tipo', className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => (
      <Badge variant='outline' className='font-medium'>
        {docTypeLabel(row.original.docType)}
      </Badge>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    // Coluna virtual de vínculo de cadeia: oculta por default, serve ao filtro
    // facetado "Cadeia" (Início / Parte / Avulso).
    id: 'chainRole',
    accessorFn: (row) => chainRole(row),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cadeia' />
    ),
    meta: { title: 'Cadeia', className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => chainRoleLabels[chainRole(row.original)],
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Título' />
    ),
    meta: {
      title: 'Título',
      className: 'ps-1 max-w-0 w-[34%]',
      tdClassName: 'ps-4',
    },
    cell: ({ row }) => (
      <div className='min-w-0'>
        <div className='truncate font-medium'>{row.original.title}</div>
        <div className='truncate text-xs text-muted-foreground'>
          {row.original.summary}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'unit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Unidade' />
    ),
    meta: { title: 'Unidade', className: 'ps-1', tdClassName: 'ps-4' },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'owner',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Responsável' />
    ),
    meta: { title: 'Responsável', className: 'ps-1', tdClassName: 'ps-4' },
  },
  {
    accessorKey: 'nature',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Natureza' />
    ),
    meta: { title: 'Natureza', className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) =>
      trNatureLabels[row.original.nature] ?? row.original.nature,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    meta: { title: 'Status', className: 'ps-1', tdClassName: 'ps-4' },
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className={trStatusBadgeClass[row.original.status] ?? ''}
      >
        {trStatusLabels[row.original.status] ?? row.original.status}
      </Badge>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'currentStep',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Etapa atual' />
    ),
    meta: { title: 'Etapa atual', className: 'ps-1', tdClassName: 'ps-4' },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Atualização' />
    ),
    meta: {
      title: 'Atualização',
      className: 'ps-1',
      tdClassName: 'ps-4 tabular-nums',
    },
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {new Intl.DateTimeFormat('pt-BR').format(
          new Date(row.original.updatedAt)
        )}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <TRsRowActions row={row} />,
  },
]
