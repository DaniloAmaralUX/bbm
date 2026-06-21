import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { type DocumentSection } from '@/features/documents/data/templates'
import { slugifySection } from './tr-document-toc'

type TRDocumentStatus = {
  label: string
  tone?: 'success' | 'warning' | 'neutral'
}

type TRDocumentViewProps = {
  title: string
  sections: DocumentSection[]
  status?: TRDocumentStatus
  /**
   * Quando true, suprime o CardHeader interno (title + badge de status).
   * Usado quando a página consumidora já mostra o título em um hero card,
   * evitando duplicação visual.
   */
  hideHeader?: boolean
}

const statusClasses: Record<NonNullable<TRDocumentStatus['tone']>, string> = {
  success:
    'border-emerald-300/70 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200',
  warning:
    'border-amber-300/70 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200',
  neutral:
    'border-slate-300/70 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200',
}

export function TRDocumentView({
  title,
  sections,
  status,
  hideHeader = false,
}: TRDocumentViewProps) {
  const validSections = sections.filter((section) => {
    if (section.kind === 'prose') return section.content.trim().length > 0
    if (section.kind === 'keyValue') return section.items.length > 0
    return section.rows.length > 0 || Boolean(section.emptyMessage)
  })

  return (
    <Card className='rounded-2xl border-0 shadow-border'>
      {!hideHeader && (
        <CardHeader className='border-b border-border/60 pb-5'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <CardTitle as={2} className='font-serif text-2xl font-semibold'>
              {title}
            </CardTitle>
            {status ? (
              <Badge
                variant='outline'
                className={statusClasses[status.tone ?? 'neutral']}
              >
                {status.label}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
      )}
      <CardContent className='space-y-6 pt-6'>
        {validSections.length ? (
          validSections.map((section) => (
            <section
              key={section.title}
              id={slugifySection(section.title)}
              className='scroll-mt-24 space-y-3'
            >
              <h2 className='font-serif text-lg font-semibold text-balance'>
                {section.title}
              </h2>

              {section.kind === 'prose' ? (
                <p className='text-sm leading-7 text-pretty break-words whitespace-pre-line text-muted-foreground'>
                  {section.content}
                </p>
              ) : null}

              {section.kind === 'keyValue' ? (
                <dl className='grid gap-3 md:grid-cols-2'>
                  {section.items.map((item) => (
                    <div
                      key={`${section.title}-${item.label}`}
                      className='rounded-2xl border border-border/60 bg-muted/20 p-4'
                    >
                      <dt className='text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase'>
                        {item.label}
                      </dt>
                      <dd className='mt-2 text-sm leading-6 break-words text-foreground'>
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {section.kind === 'table' ? (
                section.rows.length ? (
                  <div className='rounded-2xl border border-border/70'>
                    <Table aria-label={section.title}>
                      <TableHeader>
                        <TableRow>
                          {section.columns.map((column) => (
                            <TableHead key={`${section.title}-${column}`}>
                              {column}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {section.rows.map((row, rowIndex) => (
                          <TableRow key={`${section.title}-row-${rowIndex}`}>
                            {row.map((cell, cellIndex) => (
                              <TableCell
                                key={`${section.title}-row-${rowIndex}-cell-${cellIndex}`}
                                className='whitespace-normal'
                              >
                                {cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className='rounded-2xl border border-dashed border-black/5 bg-muted/20 p-6 text-sm text-muted-foreground dark:border-white/10'>
                    {section.emptyMessage ??
                      'Sem registros para exibir nesta seção.'}
                  </div>
                )
              ) : null}
            </section>
          ))
        ) : (
          <div className='rounded-2xl border border-dashed border-black/5 bg-muted/20 p-6 text-sm text-muted-foreground dark:border-white/10'>
            Este documento ainda não possui seções suficientes para exibição
            consolidada.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function TRDocumentViewSkeleton({
  sections = 4,
}: {
  sections?: number
}) {
  return (
    <Card
      aria-busy='true'
      aria-label='Carregando documento'
      className='rounded-2xl'
    >
      <CardHeader className='space-y-3'>
        <Skeleton className='h-7 w-72' />
        <Skeleton className='h-4 w-40 rounded-full' />
      </CardHeader>
      <CardContent className='space-y-6'>
        {Array.from({ length: sections }).map((_, idx) => (
          <div key={idx} className='space-y-2'>
            <Skeleton className='h-5 w-48' />
            <Skeleton className='h-3 w-full' />
            <Skeleton className='h-3 w-11/12' />
            <Skeleton className='h-3 w-4/5' />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
