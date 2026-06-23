import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  CheckCircle2,
  CircleAlert,
  FileText,
  GitBranch,
  Link2,
  Lock,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/shared/layout/header'
import { HeaderActions } from '@/shared/layout/header-actions'
import { Main } from '@/shared/layout/main'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  canBeParent,
  docTypeLabel,
  isChainRootType,
} from '@/features/documents/data/doc-type'
import { type DocumentType } from '@/features/documents/data/doc-types-registry'
import { trs } from '@/features/documents/data/trs'
import { useDocTypesStore } from '@/features/documents/store/use-doc-types-store'
import { useModelsStore } from '@/features/models/store/use-models-store'

/** Valor-sentinela do Select de pai para "sem pai" (Radix nao aceita value vazio). */
const NO_PARENT = '__none__'

/** Conta documentos (mock) e modelos de um tipo + se ha modelo publicado. */
function useTypeStats() {
  const models = useModelsStore((state) => state.models)
  return useMemo(() => {
    return (typeId: string) => {
      const ofType = models.filter((model) => model.docType === typeId)
      return {
        models: ofType.length,
        published: ofType.some((model) => model.state === 'published'),
        documents: trs.filter((doc) => doc.docType === typeId).length,
      }
    }
  }, [models])
}

function TypeCard({
  type,
  onEdit,
  onDelete,
}: {
  type: DocumentType
  onEdit: (type: DocumentType) => void
  onDelete: (type: DocumentType) => void
}) {
  const statsOf = useTypeStats()
  const stats = statsOf(type.id)

  return (
    <Card className='rounded-2xl border-0 shadow-border'>
      <CardContent className='flex h-full flex-col gap-4 p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-2'>
            <FileText
              aria-hidden='true'
              className='size-4 shrink-0 text-primary'
            />
            <span className='truncate font-semibold' translate='no'>
              {type.sigla}
            </span>
          </div>
          {type.seed ? (
            <Badge variant='outline' className='gap-1'>
              <Lock aria-hidden='true' className='size-3.5' />
              Padrão
            </Badge>
          ) : type.parentTypeId ? (
            <Badge variant='outline' className='gap-1'>
              <Link2 aria-hidden='true' className='size-3.5' />
              Segue de {docTypeLabel(type.parentTypeId)}
            </Badge>
          ) : isChainRootType(type.id) ? (
            <Badge variant='outline' className='gap-1'>
              <GitBranch aria-hidden='true' className='size-3.5' />
              Raiz de cadeia
            </Badge>
          ) : (
            <Badge variant='outline' className='gap-1'>
              Avulso
            </Badge>
          )}
        </div>

        <p className='line-clamp-2 text-sm text-muted-foreground'>
          {type.nome}
        </p>

        <dl className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
          <div>
            <dt className='text-xs text-muted-foreground'>Modelos</dt>
            <dd className='font-medium tabular-nums'>{stats.models}</dd>
          </div>
          <div>
            <dt className='text-xs text-muted-foreground'>Documentos</dt>
            <dd className='font-medium tabular-nums'>{stats.documents}</dd>
          </div>
        </dl>

        {stats.published ? (
          <Badge
            variant='outline'
            className='w-fit gap-1 border-emerald-300/70 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200'
          >
            <CheckCircle2 aria-hidden='true' className='size-3.5' />
            Pronto para uso
          </Badge>
        ) : (
          <Badge
            variant='outline'
            className='w-fit gap-1 border-amber-300/70 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200'
          >
            <CircleAlert aria-hidden='true' className='size-3.5' />
            Sem modelo publicado
          </Badge>
        )}

        <div className='mt-auto flex flex-wrap gap-2'>
          {type.seed ? (
            <p className='text-xs text-muted-foreground'>
              Tipo padrão da cadeia — não editável.
            </p>
          ) : (
            <>
              <Button
                variant='outline'
                size='sm'
                className='rounded-xl'
                onClick={() => onEdit(type)}
              >
                <Pencil aria-hidden='true' className='size-4' />
                Editar
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='rounded-xl text-destructive hover:text-destructive'
                onClick={() => onDelete(type)}
              >
                <Trash2 aria-hidden='true' className='size-4' />
                Excluir
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function TiposListPage() {
  const types = useDocTypesStore((state) => state.types)
  const createDocType = useDocTypesStore((state) => state.createDocType)
  const updateDocType = useDocTypesStore((state) => state.updateDocType)
  const deleteDocType = useDocTypesStore((state) => state.deleteDocType)
  const createDraftModel = useModelsStore((state) => state.createDraftModel)
  const deleteModel = useModelsStore((state) => state.deleteModel)
  const models = useModelsStore((state) => state.models)
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sigla, setSigla] = useState('')
  const [nome, setNome] = useState('')
  const [parentTypeId, setParentTypeId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<DocumentType | null>(null)

  const q = query.trim().toLowerCase()
  const ordered = useMemo(
    () => [...types].sort((a, b) => a.order - b.order),
    [types]
  )
  const filtered = useMemo(
    () =>
      q
        ? ordered.filter((type) =>
            `${type.sigla} ${type.nome}`.toLowerCase().includes(q)
          )
        : ordered,
    [ordered, q]
  )

  // Tipos validos como pai: na edicao, exclui o proprio e seus descendentes
  // (evita ciclo); na criacao, qualquer tipo serve.
  const parentOptions = useMemo(
    () =>
      ordered.filter((type) =>
        editingId ? canBeParent(editingId, type.id) : true
      ),
    [ordered, editingId]
  )

  function openCreate() {
    setEditingId(null)
    setSigla('')
    setNome('')
    setParentTypeId(null)
    setFormOpen(true)
  }

  function openEdit(type: DocumentType) {
    setEditingId(type.id)
    setSigla(type.sigla)
    setNome(type.nome)
    setParentTypeId(type.parentTypeId)
    setFormOpen(true)
  }

  const canSubmit = sigla.trim().length > 0 && nome.trim().length > 0

  function handleSubmit() {
    if (!canSubmit) return
    if (editingId) {
      updateDocType(editingId, { sigla, nome, parentTypeId })
      toast.success('Tipo atualizado.')
      setFormOpen(false)
      return
    }
    const typeId = createDocType({ sigla, nome, parentTypeId })
    const modelId = createDraftModel(typeId)
    setFormOpen(false)
    toast.success(`Tipo ${sigla.trim()} criado. Defina os campos do modelo.`)
    void navigate({ to: '/modelos/$modelId', params: { modelId } })
  }

  const deletingDocs = deleting
    ? trs.filter((doc) => doc.docType === deleting.id).length
    : 0
  const deletingModels = deleting
    ? models.filter((model) => model.docType === deleting.id).length
    : 0

  function handleDelete() {
    if (!deleting || deletingDocs > 0) return
    models
      .filter((model) => model.docType === deleting.id)
      .forEach((model) => deleteModel(model.id))
    deleteDocType(deleting.id)
    toast.success(`Tipo ${deleting.sigla} excluído.`)
    setDeleting(null)
  }

  const hasResults = filtered.length > 0

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-semibold tracking-tight text-balance'>
              Tipos de documento
            </h1>
            <p className='max-w-2xl text-sm text-muted-foreground'>
              A Sustentação define os tipos de documento da fase preparatória.
              DFD, ETP e TR são padrão e formam a cadeia; tipos novos são
              avulsos e ficam prontos quando têm um modelo publicado.
            </p>
          </div>
          <Button className='rounded-xl' onClick={openCreate}>
            <Plus aria-hidden='true' className='size-4' />
            Novo tipo
          </Button>
        </div>

        <div className='relative w-full max-w-sm'>
          <Search
            aria-hidden='true'
            className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'
          />
          <Input
            type='search'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Buscar tipo por sigla ou nome…'
            aria-label='Buscar tipos de documento'
            className='ps-9'
          />
        </div>

        {hasResults ? (
          <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {filtered.map((type) => (
              <TypeCard
                key={type.id}
                type={type}
                onEdit={openEdit}
                onDelete={setDeleting}
              />
            ))}
          </div>
        ) : (
          <p className='rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground'>
            Nenhum tipo encontrado para “{query}”.
          </p>
        )}
      </Main>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar tipo' : 'Novo tipo de documento'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Atualize a sigla, o nome e a cadeia. O identificador do tipo não muda.'
                : 'Informe a sigla e o nome. Depois você define os campos do modelo e o publica para liberar o tipo.'}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='tipo-sigla'>Sigla</FieldLabel>
              <Input
                id='tipo-sigla'
                value={sigla}
                onChange={(event) => setSigla(event.target.value)}
                placeholder='Ex.: LDO'
                autoComplete='off'
              />
            </Field>
            <Field>
              <FieldLabel htmlFor='tipo-nome'>Nome</FieldLabel>
              <Input
                id='tipo-nome'
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder='Ex.: Laudo Técnico'
                autoComplete='off'
              />
            </Field>
            <Field>
              <FieldLabel htmlFor='tipo-parent'>Segue de (cadeia)</FieldLabel>
              <Select
                value={parentTypeId ?? NO_PARENT}
                onValueChange={(value) =>
                  setParentTypeId(value === NO_PARENT ? null : value)
                }
              >
                <SelectTrigger id='tipo-parent'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PARENT}>Nenhum (avulso)</SelectItem>
                  {parentOptions.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.sigla} - {type.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Documentos deste tipo herdam os campos comuns do tipo anterior,
                como na cadeia DFD, ETP e TR.
              </FieldDescription>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button variant='outline' onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {editingId ? 'Salvar' : 'Criar e definir modelo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deletingDocs > 0
                ? `Não é possível excluir ${deleting?.sigla}`
                : `Excluir ${deleting?.sigla}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deletingDocs > 0
                ? `Existem ${deletingDocs} documento(s) deste tipo. Exclua-os antes de remover o tipo.`
                : `O tipo${deletingModels > 0 ? ` e seus ${deletingModels} modelo(s)` : ''} serão removidos permanentemente. Esta ação não pode ser desfeita.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {deletingDocs > 0 ? 'Fechar' : 'Cancelar'}
            </AlertDialogCancel>
            {deletingDocs === 0 ? (
              <AlertDialogAction
                onClick={handleDelete}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/40'
              >
                Excluir
              </AlertDialogAction>
            ) : null}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
