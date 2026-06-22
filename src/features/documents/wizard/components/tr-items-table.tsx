import { useState } from 'react'
import { Plus, Sparkles, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import {
  columnSum,
  emptyItemRow,
  formatColumnCell,
  isMonetaryColumn,
  summableColumns,
} from '@/features/documents/data/calc'
import {
  type ItemRow,
  formatBRL,
  formatQuantity,
  parseItems,
  serializeItems,
  suggestedItems,
} from '@/features/documents/data/items'
import { type ItemColumnDef } from '@/features/documents/data/templates'

type TRItemsTableProps = {
  value: string
  columns: ItemColumnDef[]
  onChange: (next: string) => void
  readOnly?: boolean
}

/**
 * Editor da tabela de itens (campo `itemsTable`). As colunas são definidas no
 * modelo (texto/número/moeda editáveis; calculada é read-only e derivada por
 * linha). As linhas são serializadas como JSON (mapa célula-por-coluna) no valor
 * string do campo. "Sugerir itens" só aparece quando as colunas batem com o
 * padrão (apoio de IA mockado, RF-11). O rodapé soma as colunas somáveis.
 */
export function TRItemsTable({
  value,
  columns,
  onChange,
  readOnly = false,
}: TRItemsTableProps) {
  const [rows, setRows] = useState<ItemRow[]>(() => parseItems(value))

  const commit = (next: ItemRow[]) => {
    setRows(next)
    onChange(serializeItems(next))
  }
  const updateCell = (id: string, colId: string, cellValue: string) =>
    commit(
      rows.map((row) =>
        row.id === id
          ? { ...row, cells: { ...row.cells, [colId]: cellValue } }
          : row
      )
    )
  const removeRow = (id: string) => commit(rows.filter((row) => row.id !== id))
  const addRow = () => commit([...rows, emptyItemRow()])
  const suggest = () => commit([...rows, ...suggestedItems()])

  const summable = summableColumns(columns)
  // A sugestão mockada assume as colunas padrão (descrição + preço unitário).
  const canSuggest =
    !readOnly &&
    columns.some((column) => column.id === 'description') &&
    columns.some((column) => column.id === 'unitPrice')
  const colCount = columns.length + (readOnly ? 0 : 1)

  return (
    <div className='space-y-3'>
      <div className='overflow-x-auto rounded-2xl border'>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(column.type !== 'text' && 'text-right')}
                >
                  {column.label}
                </TableHead>
              ))}
              {readOnly ? null : <TableHead className='w-10' />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colCount}
                  className='py-6 text-center text-sm text-muted-foreground'
                >
                  Nenhum item. Adicione um item
                  {canSuggest ? ' ou use "Sugerir itens"' : ''}.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => {
                    const numeric =
                      column.type === 'number' || column.type === 'currency'
                    const editable = !readOnly && column.type !== 'calculated'
                    return (
                      <TableCell
                        key={column.id}
                        className={cn(
                          (numeric || column.type === 'calculated') &&
                            'text-right tabular-nums',
                          column.type === 'calculated' && 'font-medium'
                        )}
                      >
                        {editable ? (
                          <Input
                            value={row.cells[column.id] ?? ''}
                            inputMode={numeric ? 'decimal' : undefined}
                            onChange={(event) =>
                              updateCell(row.id, column.id, event.target.value)
                            }
                            placeholder={
                              column.type === 'currency' ? '0,00' : column.label
                            }
                            aria-label={column.label}
                            className={cn(
                              'h-9',
                              numeric ? 'text-right' : 'min-w-40'
                            )}
                          />
                        ) : (
                          formatColumnCell(row, column, columns)
                        )}
                      </TableCell>
                    )
                  })}
                  {readOnly ? null : (
                    <TableCell>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='size-8 text-muted-foreground hover:text-destructive'
                        onClick={() => removeRow(row.id)}
                        aria-label='Remover item'
                      >
                        <Trash2 aria-hidden='true' className='size-4' />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3'>
        {readOnly ? (
          <span />
        ) : (
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='rounded-xl'
              onClick={addRow}
            >
              <Plus aria-hidden='true' className='size-4' />
              Adicionar item
            </Button>
            {canSuggest ? (
              <>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='rounded-xl'
                  onClick={suggest}
                >
                  <Sparkles aria-hidden='true' className='size-4' />
                  Sugerir itens
                </Button>
                <Badge
                  variant='outline'
                  className='gap-1 text-muted-foreground'
                >
                  <Sparkles aria-hidden='true' className='size-3' />
                  Sugestão mockada
                </Badge>
              </>
            ) : null}
          </div>
        )}
        {summable.length > 0 && rows.length > 0 ? (
          <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground'>
            {summable.map((column) => (
              <span key={column.id}>
                {column.label}:{' '}
                <span className='font-semibold text-foreground tabular-nums'>
                  {isMonetaryColumn(column, columns)
                    ? formatBRL(columnSum(rows, column, columns))
                    : formatQuantity(columnSum(rows, column, columns))}
                </span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
