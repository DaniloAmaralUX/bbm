import { Link } from '@tanstack/react-router'
import { type Row } from '@tanstack/react-table'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import {
  trStatusBadgeClass,
  trStatusLabels,
} from '@/features/documents/data/data'
import { docTypeLabel } from '@/features/documents/data/doc-type'
import { type TRItem } from '@/features/documents/data/schema'
import { TRsRowActions } from './trs-row-actions'

/**
 * Cartão de documento para a listagem no mobile/tablet (abaixo de lg), em lugar
 * da tabela com rolagem horizontal. Consome a MESMA linha do TanStack Table
 * (ordenação/filtro/paginação valem para os dois), reaproveitando o status e as
 * ações de linha. Mantém ID, tipo, status, título/resumo, unidade, responsável
 * e data.
 */
export function TRsCard({ row }: { row: Row<TRItem> }) {
  const item = row.original

  return (
    <Card className='rounded-2xl border shadow-none'>
      <CardContent className='space-y-3 p-4'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <Link
              to='/documentos/$documentoId'
              params={{ documentoId: item.id }}
              className='font-mono text-sm font-medium text-primary underline-offset-4 hover:underline'
            >
              {item.id}
            </Link>
            <Badge variant='outline' className='font-medium'>
              {docTypeLabel(item.docType)}
            </Badge>
            <Badge
              variant='outline'
              className={trStatusBadgeClass[item.status] ?? ''}
            >
              {trStatusLabels[item.status] ?? item.status}
            </Badge>
          </div>
          <TRsRowActions row={row} />
        </div>

        <div className='min-w-0'>
          <Link
            to='/documentos/$documentoId'
            params={{ documentoId: item.id }}
            className='block leading-snug font-medium underline-offset-4 hover:underline'
          >
            {item.title}
          </Link>
          <p className='mt-1 line-clamp-2 text-xs text-muted-foreground'>
            {item.summary}
          </p>
        </div>

        <div className='flex items-center justify-between gap-2 text-xs text-muted-foreground'>
          <span className='truncate'>
            {item.unit} · {item.owner}
          </span>
          <span className='shrink-0 tabular-nums'>
            {new Intl.DateTimeFormat('pt-BR').format(new Date(item.updatedAt))}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
