import { useState } from 'react'
import { Plus, Sparkles, Trash2 } from 'lucide-react'
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
  type ItemRow,
  emptyItem,
  formatBRL,
  formatQuantity,
  itemsTotal,
  parseItems,
  rowTotal,
  serializeItems,
  suggestedItems,
} from '@/features/documents/data/items'

type TRItemsTableProps = {
  value: string
  onChange: (next: string) => void
  readOnly?: boolean
}

function parseNumber(raw: string): number {
  const parsed = Number(raw.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Editor da tabela de itens da contratação (campo `itemsTable` do TR). As linhas
 * (descrição, unidade, quantidade, preço) sao serializadas como JSON no valor
 * string do campo. "Sugerir itens" preenche linhas mockadas (apoio de IA, RF-11).
 */
export function TRItemsTable({
  value,
  onChange,
  readOnly = false,
}: TRItemsTableProps) {
  const [rows, setRows] = useState<ItemRow[]>(() => parseItems(value))

  const commit = (next: ItemRow[]) => {
    setRows(next)
    onChange(serializeItems(next))
  }

  const updateRow = (id: string, patch: Partial<ItemRow>) =>
    commit(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  const removeRow = (id: string) => commit(rows.filter((row) => row.id !== id))
  const addRow = () => commit([...rows, emptyItem()])
  const suggest = () => commit([...rows, ...suggestedItems()])

  return (
    <div className='space-y-3'>
      <div className='overflow-x-auto rounded-2xl border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead className='w-28'>Unidade</TableHead>
              <TableHead className='w-24 text-right'>Quantidade</TableHead>
              <TableHead className='w-32 text-right'>Preço unitário</TableHead>
              <TableHead className='w-32 text-right'>Total</TableHead>
              {readOnly ? null : <TableHead className='w-10' />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={readOnly ? 5 : 6}
                  className='py-6 text-center text-sm text-muted-foreground'
                >
                  Nenhum item. Adicione um item ou use "Sugerir itens".
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {readOnly ? (
                      row.description
                    ) : (
                      <Input
                        value={row.description}
                        onChange={(event) =>
                          updateRow(row.id, { description: event.target.value })
                        }
                        placeholder='Descrição do item'
                        aria-label='Descrição do item'
                        className='h-9 min-w-48'
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      row.unit
                    ) : (
                      <Input
                        value={row.unit}
                        onChange={(event) =>
                          updateRow(row.id, { unit: event.target.value })
                        }
                        placeholder='un'
                        aria-label='Unidade'
                        className='h-9'
                      />
                    )}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {readOnly ? (
                      formatQuantity(row.quantity)
                    ) : (
                      <Input
                        type='number'
                        min={0}
                        inputMode='decimal'
                        value={row.quantity === 0 ? '' : row.quantity}
                        onChange={(event) =>
                          updateRow(row.id, {
                            quantity: parseNumber(event.target.value),
                          })
                        }
                        aria-label='Quantidade'
                        className='h-9 text-right'
                      />
                    )}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {readOnly ? (
                      formatBRL(row.unitPrice)
                    ) : (
                      <Input
                        type='number'
                        min={0}
                        inputMode='decimal'
                        value={row.unitPrice === 0 ? '' : row.unitPrice}
                        onChange={(event) =>
                          updateRow(row.id, {
                            unitPrice: parseNumber(event.target.value),
                          })
                        }
                        placeholder='0,00'
                        aria-label='Preço unitário'
                        className='h-9 text-right'
                      />
                    )}
                  </TableCell>
                  <TableCell className='text-right font-medium tabular-nums'>
                    {formatBRL(rowTotal(row))}
                  </TableCell>
                  {readOnly ? null : (
                    <TableCell>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='size-8 text-muted-foreground hover:text-destructive'
                        onClick={() => removeRow(row.id)}
                        aria-label={`Remover ${row.description || 'item'}`}
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
            <Badge variant='outline' className='gap-1 text-muted-foreground'>
              <Sparkles aria-hidden='true' className='size-3' />
              Sugestão mockada
            </Badge>
          </div>
        )}
        <div className='text-sm text-muted-foreground'>
          Total geral:{' '}
          <span className='font-semibold text-foreground tabular-nums'>
            {formatBRL(itemsTotal(rows))}
          </span>
        </div>
      </div>
    </div>
  )
}
