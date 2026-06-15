import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  CheckCircle2,
  ClipboardList,
  Link2,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/utils'
import { Header } from '@/shared/layout/header'
import { HeaderActions } from '@/shared/layout/header-actions'
import { Main } from '@/shared/layout/main'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Progress } from '@/shared/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import {
  type DocType,
  docTypeFullLabel,
  docTypeLabel,
  docTypes,
} from '@/features/documents/data/doc-type'
import {
  type DocumentCells,
  type FieldCell,
  cellsToDocumentData,
  isDocumentLocked,
} from '@/features/documents/data/inheritance'
import {
  type FieldDefinition,
  type SectionDefinition,
  buildReviewState,
  getModelForDocType,
} from '@/features/documents/data/templates'
import { trs } from '@/features/documents/data/trs'
import { TRAIAssistant } from './components/tr-ai-assistant'
import { TRLineagePanel } from './components/tr-lineage-panel'
import { TRStepper } from './components/tr-stepper'
import { useTRWizard } from './store/use-tr-wizard'

type StepErrors = Record<string, string>

type TRWizardPageProps = {
  duplicateFrom?: string
}

export function TRWizardPage({ duplicateFrom }: TRWizardPageProps = {}) {
  const chain = useTRWizard((state) => state.chain)
  const context = useTRWizard((state) => state.context)
  const submission = useTRWizard((state) => state.submission)
  const isDirty = useTRWizard((state) => state.isDirty)
  const goToDoc = useTRWizard((state) => state.goToDoc)
  const setFieldValue = useTRWizard((state) => state.setFieldValue)
  const revertField = useTRWizard((state) => state.revertField)
  const concludeCurrent = useTRWizard((state) => state.concludeCurrent)
  const saveDraft = useTRWizard((state) => state.saveDraft)
  const setAssistantTarget = useTRWizard((state) => state.setAssistantTarget)
  const seedFromDuplicate = useTRWizard((state) => state.seedFromDuplicate)

  const current = chain.current
  const isDone = chain.done[current]
  const model = getModelForDocType(current)
  const cells = chain.cells[current]
  const documentData = useMemo(() => cellsToDocumentData(cells), [cells])

  const reviewState = useMemo(
    () =>
      buildReviewState(
        { title: context.title, responsibleUnit: context.responsibleUnit },
        model,
        documentData
      ),
    [context.title, context.responsibleUnit, model, documentData]
  )

  const lockedMap = useMemo<Record<DocType, boolean>>(() => {
    const map = {} as Record<DocType, boolean>
    for (const docType of docTypes) {
      map[docType] = isDocumentLocked(chain, docType)
    }
    return map
  }, [chain])

  const fieldSections = useMemo<SectionDefinition[]>(
    () => model.sections.filter((section) => section.kind === 'fields'),
    [model]
  )

  // Erros escopados ao documento corrente: ao trocar de doc na cadeia, os erros
  // se invalidam sozinhos (sem setState sincrono em efeito).
  const [errorState, setErrorState] = useState<{
    doc: DocType
    values: StepErrors
  }>({ doc: current, values: {} })
  const errors = errorState.doc === current ? errorState.values : {}

  // Semeia o wizard a partir de uma TR fonte quando vem de "Duplicar".
  const seededRef = useRef(false)
  useEffect(() => {
    if (!duplicateFrom || seededRef.current) return
    const source = trs.find((item) => item.id === duplicateFrom)
    if (!source) return
    seededRef.current = true
    seedFromDuplicate({ id: source.id, title: source.title, unit: source.unit })
    toast.success(`Editando uma cópia de ${source.id}`)
  }, [duplicateFrom, seedFromDuplicate])

  // Reflete o documento corrente na URL (?tipo=) para deep-link/refresh.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('tipo', current)
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${params.toString()}`
    )
  }, [current])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem('tr-wizard-onboarded')) return
    toast('Bem-vindo à Fase Preparatória', {
      description:
        'Edite a cadeia DFD, ETP e TR pelo mesmo motor. Os campos comuns são herdados; conclua um documento para liberar o próximo.',
      duration: 8000,
    })
    window.localStorage.setItem('tr-wizard-onboarded', 'true')
  }, [])

  useEffect(() => {
    if (!isDirty) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Limpa o alvo da IA ao trocar de documento (os erros se invalidam pelo escopo).
  useEffect(() => {
    setAssistantTarget(null)
  }, [current, setAssistantTarget])

  // Autosave: 800ms apos a ultima edicao, espelha o comportamento anterior.
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    'idle' | 'saving' | 'saved'
  >('idle')
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!isDirty) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    const savingTimer = setTimeout(() => setAutoSaveStatus('saving'), 0)
    autoSaveTimer.current = setTimeout(() => {
      saveDraft()
      setAutoSaveStatus('saved')
    }, 800)
    return () => {
      clearTimeout(savingTimer)
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [isDirty, saveDraft])

  const completionPercent = Math.round(
    (reviewState.completedRequired / Math.max(reviewState.totalRequired, 1)) *
      100
  )

  const handleSaveDraft = () => {
    saveDraft()
    setAutoSaveStatus('saved')
    toast.success('Rascunho salvo com sucesso.')
  }

  const handleConclude = () => {
    const nextErrors = validateDocument(documentData, model)
    setErrorState({ doc: current, values: nextErrors })
    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      focusField(firstError)
      toast.error('Preencha os campos obrigatórios antes de concluir.')
      return
    }
    concludeCurrent()
    toast.success(`${docTypeLabel(current)} concluído.`)
  }

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValue(fieldId, value)
    setErrorState((prev) => {
      const base = prev.doc === current ? prev.values : {}
      if (!base[fieldId]) return { doc: current, values: base }
      const next = { ...base }
      delete next[fieldId]
      return { doc: current, values: next }
    })
  }

  const handleFieldFocus = (field: FieldDefinition, sectionId: string) => {
    setAssistantTarget({ fieldId: field.id, sectionId })
  }

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main className='space-y-6 pb-8'>
        <section className='flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border border-black/5 bg-background/60 px-4 py-3 dark:border-white/10'>
          <div className='flex min-w-0 items-center gap-3'>
            <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <ClipboardList aria-hidden='true' className='size-4' />
            </div>
            <div className='min-w-0'>
              <h1 className='text-base font-semibold tracking-tight text-balance'>
                Cadeia da fase preparatória
              </h1>
              <p className='line-clamp-2 text-xs text-pretty text-muted-foreground'>
                Um motor para os três documentos. Os campos comuns fluem do DFD
                para o ETP e o TR por herança.
              </p>
            </div>
          </div>

          <div className='flex flex-1 items-center justify-end gap-3 sm:flex-initial'>
            <div className='hidden min-w-[180px] flex-1 sm:block sm:max-w-[220px]'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-muted-foreground'>
                  Obrigatórios do{' '}
                  <span translate='no'>{docTypeLabel(current)}</span>
                </span>
                <span className='font-semibold tabular-nums'>
                  {reviewState.completedRequired}/{reviewState.totalRequired}
                </span>
              </div>
              <Progress
                value={completionPercent}
                aria-label={`Campos obrigatórios preenchidos no ${docTypeLabel(current)}`}
                className='mt-1 h-1.5'
              />
            </div>
          </div>
        </section>

        <TRStepper
          current={current}
          done={chain.done}
          locked={lockedMap}
          onSelect={goToDoc}
        />

        <div className='grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]'>
          <div className='space-y-6'>
            <Card className='rounded-3xl border-0 shadow-border'>
              <CardHeader>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div className='space-y-1.5'>
                    <p className='text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase'>
                      <span translate='no'>{docTypeLabel(current)}</span>
                    </p>
                    <CardTitle as={2}>{docTypeFullLabel(current)}</CardTitle>
                    <CardDescription>{model.intro}</CardDescription>
                  </div>
                  <DocStatusBadge isDone={isDone} />
                </div>
              </CardHeader>
              <CardContent className='space-y-8'>
                {isDone ? (
                  <Alert>
                    <CheckCircle2 aria-hidden='true' className='size-4' />
                    <AlertTitle>Documento concluído</AlertTitle>
                    <AlertDescription>
                      Este {docTypeLabel(current)} foi concluído e está em modo
                      somente leitura. Os campos comuns já fluíram para o
                      próximo documento da cadeia.
                    </AlertDescription>
                  </Alert>
                ) : null}

                {/* key força @starting-style ao trocar de documento. */}
                <div key={current} className='step-content-enter space-y-8'>
                  {fieldSections.map((section) => (
                    <FieldSection
                      key={section.id}
                      section={section}
                      model={model}
                      cells={cells}
                      errors={errors}
                      readOnly={isDone}
                      docType={current}
                      onChange={handleFieldChange}
                      onRevert={(fieldId) => {
                        revertField(fieldId)
                        toast.success('Valor herdado restaurado.')
                      }}
                      onFieldFocus={handleFieldFocus}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {!isDone ? <TRAIAssistant /> : null}
          </div>

          <aside aria-label='Herança do documento' className='space-y-6'>
            <TRLineagePanel docType={current} cells={cells} />
          </aside>
        </div>

        <div className='sticky bottom-4 z-30 [touch-action:manipulation]'>
          <Card className='rounded-2xl border-black/5 bg-background/95 shadow-lg backdrop-blur dark:border-white/10'>
            <CardContent className='flex flex-wrap items-center justify-between gap-3 px-5 py-4'>
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  {autoSaveStatus === 'saving' ? (
                    <>
                      <Loader2
                        aria-hidden='true'
                        className='size-3.5 animate-spin-fast'
                      />
                      <span>Salvando rascunho…</span>
                    </>
                  ) : autoSaveStatus === 'saved' && submission.savedAt ? (
                    <>
                      <Check
                        aria-hidden='true'
                        className='size-3.5 text-primary'
                      />
                      <span>Salvo às {submission.savedAt}</span>
                    </>
                  ) : (
                    <span className='opacity-70'>
                      Alterações são salvas automaticamente
                    </span>
                  )}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {isDone
                    ? `${docTypeLabel(current)} concluído.`
                    : reviewState.isReady
                      ? `Tudo pronto para concluir o ${docTypeLabel(current)}.`
                      : `Preencha os campos obrigatórios do ${docTypeLabel(current)}.`}
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  className='rounded-xl'
                  onClick={handleSaveDraft}
                  disabled={isDone}
                >
                  <Save data-icon='inline-start' />
                  Salvar rascunho
                </Button>
                <Button
                  type='button'
                  className='rounded-xl'
                  onClick={handleConclude}
                  disabled={isDone}
                >
                  <CheckCircle2 data-icon='inline-start' />
                  {isDone
                    ? `${docTypeLabel(current)} concluído`
                    : `Concluir ${docTypeLabel(current)}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}

function DocStatusBadge({ isDone }: { isDone: boolean }) {
  if (isDone) {
    return (
      <Badge
        variant='outline'
        className='gap-1.5 rounded-full border-primary/30 bg-secondary px-3 py-1 text-secondary-foreground'
      >
        <Check aria-hidden='true' className='size-3.5' />
        Concluído
      </Badge>
    )
  }
  return (
    <Badge
      variant='outline'
      className='gap-1.5 rounded-full px-3 py-1 text-muted-foreground'
    >
      <Pencil aria-hidden='true' className='size-3.5' />
      Rascunho
    </Badge>
  )
}

function FieldSection({
  section,
  model,
  cells,
  errors,
  readOnly,
  docType,
  onChange,
  onRevert,
  onFieldFocus,
}: {
  section: SectionDefinition
  model: ReturnType<typeof getModelForDocType>
  cells: DocumentCells
  errors: StepErrors
  readOnly: boolean
  docType: DocType
  onChange: (fieldId: string, value: string) => void
  onRevert: (fieldId: string) => void
  onFieldFocus: (field: FieldDefinition, sectionId: string) => void
}) {
  const fields = (section.fieldIds ?? [])
    .map((fieldId) => model.fields[fieldId])
    .filter((field): field is FieldDefinition => Boolean(field))

  if (!fields.length) return null

  return (
    <section className='space-y-4'>
      <div>
        <h3 className='text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase'>
          {section.title}
        </h3>
        {section.description ? (
          <p className='mt-1 text-xs text-muted-foreground'>
            {section.description}
          </p>
        ) : null}
      </div>
      <div className='grid gap-5 md:grid-cols-2'>
        {fields.map((field) => {
          const cell = cells[field.id] ?? { value: '', origin: 'own' as const }
          return (
            <FieldRow
              key={field.id}
              field={field}
              cell={cell}
              error={errors[field.id]}
              readOnly={readOnly}
              docType={docType}
              sectionId={section.id}
              className={
                field.input === 'textarea' ? 'md:col-span-2' : undefined
              }
              onChange={(value) => onChange(field.id, value)}
              onRevert={() => onRevert(field.id)}
              onFocus={() => onFieldFocus(field, section.id)}
            />
          )
        })}
      </div>
    </section>
  )
}

function FieldRow({
  field,
  cell,
  error,
  readOnly,
  docType,
  className,
  onChange,
  onRevert,
  onFocus,
}: {
  field: FieldDefinition
  cell: FieldCell
  error?: string
  readOnly: boolean
  docType: DocType
  sectionId: string
  className?: string
  onChange: (value: string) => void
  onRevert: () => void
  onFocus: () => void
}) {
  const isInherited = cell.origin === 'inherited'
  const isAdjusted = cell.origin === 'adjusted'
  const describedBy =
    [
      field.description ? `${field.id}-desc` : null,
      error ? `${field.id}-error` : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined

  const ariaProps = {
    'aria-required': field.required || undefined,
    'aria-invalid': Boolean(error) || undefined,
    'aria-describedby': describedBy,
  } as const

  // Assinatura visual da heranca: lavagem de acento verde sutil no fundo do
  // campo herdado (sem borda-faixa lateral). Ajustado nao recebe lavagem.
  const controlClassName = cn(
    'rounded-xl transition-colors duration-200 ease-[var(--ease-emil-out)] motion-reduce:transition-none',
    isInherited && 'bg-primary/5 border-primary/30'
  )
  const textareaClassName = cn(
    'min-h-32 rounded-2xl transition-colors duration-200 ease-[var(--ease-emil-out)] motion-reduce:transition-none',
    isInherited && 'bg-primary/5 border-primary/30'
  )

  return (
    <Field
      data-invalid={Boolean(error) || undefined}
      className={cn('gap-2', className)}
    >
      <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
        <FieldLabel htmlFor={field.id} className='text-sm font-medium'>
          {field.label}
          {field.required ? (
            <>
              <span aria-hidden='true' className='ms-0.5 text-destructive'>
                *
              </span>
              <span className='sr-only'> (obrigatório)</span>
            </>
          ) : null}
        </FieldLabel>
        {isInherited ? (
          <Badge
            variant='outline'
            className='gap-1 rounded-full border-primary/20 bg-secondary px-2 py-0 text-[11px] font-semibold text-secondary-foreground'
          >
            <Link2 aria-hidden='true' className='size-3' />
            Herdado de{' '}
            {cell.inheritedFrom ? docTypeLabel(cell.inheritedFrom) : ''}
          </Badge>
        ) : null}
        {isAdjusted ? (
          <Badge
            variant='outline'
            className='gap-1 rounded-full border-amber-300 bg-amber-50 px-2 py-0 text-[11px] font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200'
          >
            <Pencil aria-hidden='true' className='size-3' />
            Ajustado
          </Badge>
        ) : null}
      </div>

      {field.input === 'select' ? (
        <Select
          value={cell.value}
          onValueChange={(next) => onChange(next)}
          disabled={readOnly}
        >
          <SelectTrigger
            id={field.id}
            name={field.id}
            data-field-id={field.id}
            className={controlClassName}
            onFocus={onFocus}
            {...ariaProps}
          >
            <SelectValue
              placeholder={field.placeholder ?? 'Selecione uma opção'}
            />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.input === 'textarea' ? (
        <Textarea
          id={field.id}
          name={field.id}
          data-field-id={field.id}
          autoComplete={field.autocomplete ?? 'off'}
          spellCheck={field.spellCheck ?? true}
          placeholder={field.placeholder}
          value={cell.value}
          disabled={readOnly}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          className={textareaClassName}
          {...ariaProps}
        />
      ) : (
        <Input
          id={field.id}
          name={field.id}
          type={field.input}
          data-field-id={field.id}
          autoComplete={field.autocomplete ?? 'off'}
          spellCheck={
            field.spellCheck ?? (field.input === 'email' ? false : true)
          }
          enterKeyHint='next'
          placeholder={field.placeholder}
          value={cell.value}
          disabled={readOnly}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          className={controlClassName}
          {...ariaProps}
        />
      )}

      {field.description ? (
        <FieldDescription id={`${field.id}-desc`} className='text-xs'>
          {field.description}
        </FieldDescription>
      ) : null}

      {isAdjusted && !readOnly ? (
        <Button
          type='button'
          variant='link'
          size='sm'
          className='h-auto w-fit! gap-1.5 self-start p-0 text-xs font-semibold text-secondary-foreground'
          onClick={onRevert}
        >
          <RotateCcw aria-hidden='true' className='size-3.5' />
          Restaurar valor herdado
        </Button>
      ) : null}

      {error ? (
        <FieldError id={`${field.id}-error`} className='field-error'>
          {error}
        </FieldError>
      ) : null}

      <span className='sr-only'>
        {isInherited
          ? `Campo herdado do ${docType === 'dfd' ? '' : cell.inheritedFrom ? docTypeFullLabel(cell.inheritedFrom) : ''}.`
          : ''}
      </span>
    </Field>
  )
}

function validateDocument(
  documentData: Record<string, string>,
  model: ReturnType<typeof getModelForDocType>
): StepErrors {
  const nextErrors: StepErrors = {}
  Object.values(model.fields).forEach((field) => {
    if (!field.required) return
    const value = String(documentData[field.id] ?? '').trim()
    if (!value) {
      nextErrors[field.id] = `Preencha o campo "${field.label}".`
      return
    }
    if (field.input === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      nextErrors[field.id] = 'Informe um e-mail válido.'
    }
  })
  return nextErrors
}

function focusField(fieldId: string) {
  const element = document.querySelector<HTMLElement>(
    `[data-field-id="${fieldId}"]`
  )
  if (!element) return
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
  element.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'center',
  })
  element.focus({ preventScroll: true })
}
