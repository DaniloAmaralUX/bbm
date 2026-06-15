import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { CheckCircle2, FileText, Pencil, PencilRuler, Plus } from 'lucide-react'
import { Header } from '@/shared/layout/header'
import { HeaderActions } from '@/shared/layout/header-actions'
import { Main } from '@/shared/layout/main'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { SectionLabel } from '@/shared/components/section-label'
import {
  type DocType,
  docTypeFullLabel,
  docTypeLabel,
  docTypes,
} from '@/features/documents/data/doc-type'
import { type ModelDefinition } from '@/features/documents/data/templates'
import { useModelsStore } from './store/use-models-store'

const dateFormatter = new Intl.DateTimeFormat('pt-BR')

function StateBadge({ state }: { state: ModelDefinition['state'] }) {
  if (state === 'published') {
    return (
      <Badge
        variant='outline'
        className='gap-1 border-emerald-300/70 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200'
      >
        <CheckCircle2 aria-hidden='true' className='size-3.5' />
        Publicado
      </Badge>
    )
  }
  return (
    <Badge variant='outline' className='gap-1'>
      <Pencil aria-hidden='true' className='size-3.5' />
      Rascunho
    </Badge>
  )
}

function ModelCard({ model }: { model: ModelDefinition }) {
  const navigate = useNavigate()
  const fieldCount = Object.keys(model.fields).length
  const sectionCount = model.sections.filter(
    (section) => section.kind === 'fields'
  ).length

  return (
    <Card className='rounded-2xl border-0 shadow-border'>
      <CardContent className='flex h-full flex-col gap-4 p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <FileText aria-hidden='true' className='size-4 text-primary' />
            <span className='font-semibold'>{model.name}</span>
          </div>
          <StateBadge state={model.state} />
        </div>

        <dl className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
          <div>
            <dt className='text-xs text-muted-foreground'>Campos</dt>
            <dd className='font-medium tabular-nums'>{fieldCount}</dd>
          </div>
          <div>
            <dt className='text-xs text-muted-foreground'>Seções</dt>
            <dd className='font-medium tabular-nums'>{sectionCount}</dd>
          </div>
          <div>
            <dt className='text-xs text-muted-foreground'>Versão</dt>
            <dd className='font-medium tabular-nums'>v{model.version}</dd>
          </div>
          <div>
            <dt className='text-xs text-muted-foreground'>Atualizado</dt>
            <dd className='font-medium tabular-nums'>
              {dateFormatter.format(new Date(model.updatedAt))}
            </dd>
          </div>
        </dl>

        <div className='mt-auto flex flex-wrap gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='rounded-xl'
            onClick={() =>
              navigate({
                to: '/modelos/$modelId',
                params: { modelId: model.id },
              })
            }
          >
            <PencilRuler aria-hidden='true' className='size-4' />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ModelsListPage() {
  const models = useModelsStore((state) => state.models)
  const createDraftModel = useModelsStore((state) => state.createDraftModel)
  const navigate = useNavigate()
  const groups = useMemo(
    () =>
      docTypes.map((docType) => ({
        docType,
        items: models.filter((model) => model.docType === docType),
      })),
    [models]
  )

  function handleCreate(docType: DocType) {
    const id = createDraftModel(docType)
    void navigate({ to: '/modelos/$modelId', params: { modelId: id } })
  }

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 stagger-fade-in flex-col gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-semibold tracking-tight text-balance'>
              Modelos
            </h1>
            <p className='max-w-2xl text-sm text-muted-foreground'>
              Estruturas dos documentos DFD, ETP e TR. A Sustentação cria, edita
              e publica os modelos que o requisitante usa para gerar os
              documentos.
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='rounded-xl'>
                <Plus aria-hidden='true' className='size-4' />
                Novo modelo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel>Tipo do documento</DropdownMenuLabel>
              {docTypes.map((docType) => (
                <DropdownMenuItem
                  key={docType}
                  onSelect={() => handleCreate(docType)}
                >
                  <FileText aria-hidden='true' className='size-4' />
                  {docTypeLabel(docType)} - {docTypeFullLabel(docType)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {groups.map((group) => (
          <section key={group.docType} className='space-y-3'>
            <SectionLabel>
              {docTypeFullLabel(group.docType)} - {docTypeLabel(group.docType)}
            </SectionLabel>
            <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
              {group.items.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          </section>
        ))}
      </Main>
    </>
  )
}
