import { Link } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, FilePenLine, FilePlus2 } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/shared/layout/header'
import { HeaderActions } from '@/shared/layout/header-actions'
import { Main } from '@/shared/layout/main'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { SectionLabel } from '@/shared/components/section-label'
import {
  canStartChildOf,
  childrenOf,
  nextChildTypeOf,
} from '@/features/documents/data/chain'
import {
  trStatusBadgeClass,
  trStatusLabels,
} from '@/features/documents/data/data'
import { docTypeLabel } from '@/features/documents/data/doc-type'
import { getTRById, getTRDocument } from '@/features/documents/data/tr-document'
import { trs } from '@/features/documents/data/trs'
import { TRDocumentToc } from './components/tr-document-toc'
import { TRDocumentView } from './components/tr-document-view'

type TRViewPageProps = {
  trId?: string
  mode?: 'edit' | 'view'
}

export function TRViewPage({ trId, mode = 'view' }: TRViewPageProps) {
  const document = getTRDocument(trId)
  const item = getTRById(trId)
  const isApproved = document.status === 'approved'

  // Pode iniciar o proximo da cadeia (ETP a partir de DFD concluido, etc.) se o
  // documento esta concluido e ainda nao tem filho.
  const childType = nextChildTypeOf(item)
  const canStartChild =
    canStartChildOf(item) && childrenOf(item.id, trs).length === 0
  const formattedDate = new Intl.DateTimeFormat('pt-BR').format(
    new Date(document.updatedAt)
  )

  // Último slot do grid muda conforme estado:
  // - approved: "Aprovado em" usando updatedAt como proxy (sem campo dedicado)
  // - rascunho: "Etapa atual" do wizard
  const lastSlot = isApproved
    ? { label: 'Aprovado em', value: formattedDate }
    : { label: 'Etapa atual', value: document.currentStep }

  return (
    <>
      <Header>
        <HeaderActions />
      </Header>

      <Main className='stagger-fade-in space-y-6 pb-8'>
        {mode === 'edit' && (
          <Alert
            role='status'
            className='border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100 [&>svg]:text-amber-700 dark:[&>svg]:text-amber-300'
          >
            <FilePenLine aria-hidden='true' className='size-4' />
            <AlertDescription>
              Modo de edição: alterações salvas automaticamente como rascunho.
            </AlertDescription>
          </Alert>
        )}

        {/* Hero header card — consolida back link + ID + título + actions + metadados inline. */}
        <Card className='rounded-2xl border-0 shadow-border'>
          <CardContent className='space-y-5 p-6'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <Button asChild variant='ghost' className='-ml-3 rounded-xl'>
                <Link to='/documentos'>
                  <ArrowLeft aria-hidden='true' className='size-4' />
                  Voltar para documentos
                </Link>
              </Button>
              <div className='flex flex-wrap gap-2'>
                <Button asChild variant='outline' className='rounded-xl'>
                  <Link to='/documentos/novo'>
                    <FilePenLine aria-hidden='true' className='size-4' />
                    {mode === 'edit' ? 'Continuar edição' : 'Editar'}
                  </Link>
                </Button>
                {!isApproved && (
                  <Button
                    className='rounded-xl'
                    onClick={() => toast.success(`${document.id} aprovado`)}
                  >
                    <CheckCircle2 aria-hidden='true' className='size-4' />
                    Aprovar documento
                  </Button>
                )}
                {canStartChild && childType && (
                  <Button asChild className='rounded-xl'>
                    <Link to='/documentos/novo' search={{ parentId: item.id }}>
                      <FilePlus2 aria-hidden='true' className='size-4' />
                      Iniciar {docTypeLabel(childType)}
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex flex-wrap items-center gap-3'>
                <h1 className='font-mono text-3xl font-semibold tracking-tight text-balance tabular-nums'>
                  {document.id}
                </h1>
                <Badge
                  variant='outline'
                  className={trStatusBadgeClass[document.status] ?? ''}
                >
                  {trStatusLabels[document.status] ?? document.status}
                </Badge>
              </div>
              <p className='max-w-3xl text-balance text-muted-foreground'>
                {document.title}
              </p>
            </div>

            <Separator />

            <div className='grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4'>
              <div className='space-y-1'>
                <SectionLabel>Unidade</SectionLabel>
                <div className='text-sm font-medium'>
                  {document.responsibleUnit}
                </div>
              </div>
              <div className='space-y-1'>
                <SectionLabel>Responsável</SectionLabel>
                <div className='text-sm font-medium'>{document.owner}</div>
              </div>
              <div className='space-y-1'>
                <SectionLabel>Modelo</SectionLabel>
                <div className='text-sm font-medium'>{document.model}</div>
              </div>
              <div className='space-y-1'>
                <SectionLabel>{lastSlot.label}</SectionLabel>
                <div className='text-sm font-medium tabular-nums'>
                  {lastSlot.value}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documento + TOC rail sticky (lg+); stacked + sheet flutuante no mobile. */}
        <div className='grid gap-6 lg:grid-cols-[1fr_240px] lg:items-start'>
          <TRDocumentView
            title={document.title}
            sections={document.sections}
            hideHeader
          />
          <aside className='lg:sticky lg:top-20'>
            <TRDocumentToc sections={document.sections} />
          </aside>
        </div>
      </Main>
    </>
  )
}
