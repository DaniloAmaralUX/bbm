import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Loader2,
  PanelRight,
  Save,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/shared/layout/header'
import { HeaderActions } from '@/shared/layout/header-actions'
import { Main } from '@/shared/layout/main'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Progress } from '@/shared/ui/progress'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet'
import { Separator } from '@/shared/ui/separator'
import { Textarea } from '@/shared/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import {
  type FieldDefinition,
  type SectionDefinition,
  buildDocumentSections,
  getModelForDocType,
  getResponsibleUnitOptions,
} from '@/features/documents/data/templates'
import {
  type DocType,
  docTypeFullLabel,
  docTypeLabel,
  docTypes,
} from '@/features/documents/data/doc-type'
import { TRMetaList } from '@/shared/components/tr-meta-list'
import { TRDocumentView } from '@/features/documents/view/components/tr-document-view'
import { trs } from '@/features/documents/data/trs'
import { TRAIAssistant } from './components/tr-ai-assistant'
import { TRStepper } from './components/tr-stepper'
import { useTRWizard } from './store/use-tr-wizard'

type StepErrors = Record<string, string>

type StepErrorState = {
  scope: string
  values: StepErrors
}

type TRWizardPageProps = {
  duplicateFrom?: string
}

export function TRWizardPage({ duplicateFrom }: TRWizardPageProps = {}) {
  const {
    currentStep,
    submission,
    context,
    documentData,
    reviewState,
    isDirty,
    nextStep,
    prevStep,
    goToStep,
    updateContext,
    changeDocType,
    setFieldValue,
    saveDraft,
    startSubmission,
    completeSubmission,
    setAssistantTarget,
    seedFromDuplicate,
  } = useTRWizard()

  // Semeia o wizard a partir de uma TR fonte quando vem de "Duplicar".
  // Guard via ref garante que dispara só uma vez por navegação.
  const seededRef = useRef(false)
  useEffect(() => {
    if (!duplicateFrom || seededRef.current) return
    const source = trs.find((item) => item.id === duplicateFrom)
    if (!source) return
    seededRef.current = true
    seedFromDuplicate({
      id: source.id,
      title: source.title,
      unit: source.unit,
    })
    toast.success(`Editando uma cópia de ${source.id}`)
  }, [duplicateFrom, seedFromDuplicate])

  const template = getModelForDocType(context.docType)
  const wizardSteps = useMemo<SectionDefinition[]>(
    () => [
      {
        id: 'setup',
        title: 'Configuração do Modelo',
        description:
          'Escolha o tipo de documento e a identificação básica antes de preencher.',
        kind: 'fields',
        fieldIds: [],
      },
      ...template.sections,
    ],
    [template]
  )
  const currentSection = wizardSteps[currentStep]
  const errorScope = `${currentStep}:${context.docType}`
  const [stepErrorState, setStepErrorState] = useState<StepErrorState>({
    scope: '',
    values: {},
  })
  const [pendingDocTypeChange, setPendingDocTypeChange] =
    useState<DocType | null>(null)

  const errors =
    stepErrorState.scope === errorScope ? stepErrorState.values : {}

  const documentSections = useMemo(
    () => buildDocumentSections(context, template, documentData),
    [context, template, documentData]
  )

  const pendingByStep = useMemo<number[]>(
    () =>
      wizardSteps.map((section, index) => {
        if (index === 0) {
          // O tipo de documento sempre tem um default selecionado, então a
          // etapa 0 conta apenas título e unidade responsável como pendências.
          let count = 0
          if (!context.title.trim()) count += 1
          if (!context.responsibleUnit.trim()) count += 1
          return count
        }
        if (section.kind === 'fields') {
          return (section.fieldIds ?? []).reduce((sum, fieldId) => {
            const field = template.fields[fieldId]
            if (!field?.required) return sum
            const value = String(documentData[fieldId] ?? '').trim()
            return value ? sum : sum + 1
          }, 0)
        }
        return 0
      }),
    [wizardSteps, context, documentData, template]
  )

  const completionPercent = Math.round(
    (reviewState.completedRequired / Math.max(reviewState.totalRequired, 1)) *
      100
  )

  const currentPendingCount = pendingByStep[currentStep] ?? 0

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('step', String(currentStep + 1))
    params.set('tipo', context.docType)
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${params.toString()}`
    )
  }, [currentStep, context.docType])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem('tr-wizard-onboarded')) return

    toast('Bem-vindo à Fase Preparatória', {
      description:
        'Comece pela Configuração: escolha o tipo de documento e dê um título. O wizard guia o resto.',
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

  const [autoSaveStatus, setAutoSaveStatus] = useState<
    'idle' | 'saving' | 'saved'
  >('idle')
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isDirty) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)

    // Não chamamos setState síncrono aqui (react-hooks/set-state-in-effect):
    // delegamos a transição 'saving' -> 'saved' para callbacks do setTimeout.
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

  const handleSaveDraft = () => {
    saveDraft()
    setAutoSaveStatus('saved')
    toast.success('Rascunho salvo com sucesso.')
  }

  const handleSubmit = () => {
    if (!reviewState.isReady) {
      // Navega para o primeiro step com pendência e foca o primeiro campo
      // inválido, alinhado com a guideline Vercel "focus first error on submit".
      const firstStepWithPending = pendingByStep.findIndex((count) => count > 0)
      const targetStep =
        firstStepWithPending >= 0 ? firstStepWithPending : currentStep

      goToStep(targetStep)

      const targetSection = wizardSteps[targetStep]
      if (targetSection) {
        const nextErrors = validateCurrentStep(
          targetSection,
          context,
          documentData,
          template
        )
        setStepErrorState({
          scope: `${targetSection.id}:${targetStep}`,
          values: nextErrors,
        })
        const firstErrorField = Object.keys(nextErrors)[0]
        if (firstErrorField) {
          // setTimeout 0 garante que o DOM já reflete o step novo antes do focus.
          setTimeout(() => focusField(firstErrorField), 0)
        }
      }

      toast.error('Preencha os campos obrigatórios antes de concluir.')
      return
    }

    startSubmission()
    completeSubmission()
    toast.success(`${docTypeLabel(context.docType)} concluído.`)
  }

  useEffect(() => {
    // Limpa target da IA ao trocar de etapa
    setAssistantTarget(null)
  }, [currentStep, setAssistantTarget])

  const handleFieldFocus = (field: FieldDefinition) => {
    if (currentStep === 0) return
    if (currentSection.kind !== 'fields') return
    setAssistantTarget({
      fieldId: field.id,
      sectionId: currentSection.id,
    })
  }

  const handleFieldBlur = (field: FieldDefinition, value: string) => {
    const fieldError = validateSingleField(field, value)
    setStepErrorState((prev) => {
      const baseValues = prev.scope === errorScope ? prev.values : {}
      const nextValues = { ...baseValues }
      if (fieldError) {
        nextValues[field.id] = fieldError
      } else {
        delete nextValues[field.id]
      }
      return { scope: errorScope, values: nextValues }
    })
  }

  const handleAdvance = () => {
    const nextErrors = validateCurrentStep(
      currentSection,
      context,
      documentData,
      template
    )
    setStepErrorState({ scope: errorScope, values: nextErrors })

    if (Object.keys(nextErrors).length > 0) {
      focusField(Object.keys(nextErrors)[0])
      toast.error('Revise os campos destacados antes de continuar.')
      return
    }

    nextStep()
  }

  const handleDocTypeSelect = (nextDocType: DocType) => {
    if (nextDocType === context.docType) return

    // Trocar o tipo recria o documentData. Se há dados sujos, confirmamos
    // antes de descartar; caso contrário, trocamos direto.
    if (!isDirty) {
      changeDocType(nextDocType)
      return
    }

    setPendingDocTypeChange(nextDocType)
  }

  const applyPendingDocTypeChange = () => {
    if (!pendingDocTypeChange) return
    changeDocType(pendingDocTypeChange)
    setPendingDocTypeChange(null)
  }

  const renderSummaryPanel = ({
    includeAssistant = false,
  }: { includeAssistant?: boolean } = {}) => (
    <>
      {includeAssistant ? <TRAIAssistant /> : null}
      <Card className='rounded-3xl border-0 shadow-border'>
        <CardHeader>
          <CardTitle>Resumo operacional</CardTitle>
          <CardDescription>
            Leitura rápida do documento em preparação e do próximo passo.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 text-sm'>
          {currentSection.kind !== 'review' ? (
            <div className='rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3'>
              <p className='text-xs font-semibold tracking-[0.14em] text-primary uppercase'>
                Editando agora
              </p>
              <p className='mt-1 font-medium text-foreground'>
                {currentSection.title}
              </p>
              {currentPendingCount > 0 ? (
                <p className='mt-2 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300'>
                  <AlertCircle aria-hidden='true' className='size-3.5' />
                  {currentPendingCount} pendência(s) nesta etapa
                </p>
              ) : null}
            </div>
          ) : null}
          <TRMetaList
            items={[
              {
                label: 'Tipo de documento',
                valueNode: (
                  <>
                    <span translate='no'>{docTypeLabel(context.docType)}</span>
                    <span
                      className='mx-1 text-muted-foreground'
                      aria-hidden='true'
                    >
                      ·
                    </span>
                    {template.label}
                  </>
                ),
              },
              {
                label: 'Referência',
                value: context.referenceCode || 'Não informada',
              },
              {
                label: 'Título',
                value: context.title || 'Sem título',
              },
              {
                label: 'Unidade responsável',
                value: context.responsibleUnit || 'Não informada',
              },
            ]}
          />
          <Separator />
          <div className='rounded-2xl bg-muted/30 p-4'>
            <div className='flex items-center gap-2 font-medium'>
              <FileText aria-hidden='true' className='size-4 text-primary' />
              O que vem agora
            </div>
            <p className='mt-2 text-muted-foreground'>
              {wizardSteps[currentStep + 1]?.description ??
                'Revise o documento consolidado e envie para revisão.'}
            </p>
          </div>
          {!reviewState.isReady ? (
            <Alert>
              <AlertCircle aria-hidden='true' className='size-4' />
              <AlertTitle>Pendências do modelo</AlertTitle>
              <AlertDescription>
                Ainda há {reviewState.pendingLabels.length} requisito(s)
                obrigatório(s) em aberto.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Card className='rounded-3xl border-0 shadow-border'>
        <CardHeader>
          <CardTitle>Checklist de prontidão</CardTitle>
          <CardDescription>
            O documento só fica pronto quando o modelo oficial estiver
            consistente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className='h-[320px] pr-4'>
            <div aria-live='polite' className='space-y-2 text-sm'>
              {reviewState.pendingLabels.length ? (
                reviewState.pendingLabels.map((label) => (
                  <div
                    key={label}
                    className='flex items-start gap-2 rounded-xl bg-muted/30 px-3 py-2'
                  >
                    <AlertCircle
                      aria-hidden='true'
                      className='mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-300'
                    />
                    <span className='text-muted-foreground'>{label}</span>
                  </div>
                ))
              ) : (
                <div className='flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-200'>
                  <CheckCircle2
                    aria-hidden='true'
                    className='mt-0.5 size-4 shrink-0'
                  />
                  Todos os requisitos obrigatórios do modelo estão preenchidos.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  )

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
              <h1 className='text-balance text-base font-semibold tracking-tight'>
                Criação de documento da fase preparatória
              </h1>
              <p className='line-clamp-2 text-pretty text-xs text-muted-foreground'>
                {currentSection.description}
              </p>
            </div>
          </div>

          <div className='flex flex-1 items-center justify-end gap-3 sm:flex-initial'>
            <div className='hidden min-w-[180px] flex-1 sm:block sm:max-w-[220px]'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-muted-foreground'>Obrigatórios</span>
                <span className='font-semibold tabular-nums'>
                  {reviewState.completedRequired}/{reviewState.totalRequired}
                </span>
              </div>
              <Progress
                value={completionPercent}
                aria-label='Campos obrigatórios preenchidos'
                className='mt-1 h-1.5'
              />
            </div>
          </div>
        </section>

        <TRStepper
          currentStep={currentStep}
          steps={wizardSteps}
          onStepClick={goToStep}
          pendingLabels={reviewState.pendingLabels}
          pendingByStep={pendingByStep}
        />

        <div className='space-y-6'>
          <Card className='rounded-3xl border-0 shadow-border'>
            <CardHeader>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='space-y-2'>
                  <CardTitle as={2}>{currentSection.title}</CardTitle>
                  <div aria-live='polite' className='sr-only'>
                    Etapa {currentStep + 1} de {wizardSteps.length}:{' '}
                    {currentSection.title}
                  </div>
                  <CardDescription>
                    {currentSection.description}
                  </CardDescription>
                  {reviewState.pendingLabels.length ? (
                    <Badge
                      variant='outline'
                      className='w-fit border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-200'
                    >
                      {reviewState.pendingLabels.length} pendência(s)
                    </Badge>
                  ) : null}
                </div>

                <div className='flex items-center gap-2'>
                  {currentSection.kind === 'review' ? (
                    <Badge
                      variant='outline'
                      className='gap-1.5 rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200'
                    >
                      <ShieldCheck aria-hidden='true' className='size-3.5' />
                      Prévia oficial consolidada
                    </Badge>
                  ) : (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          className='rounded-xl'
                        >
                          <PanelRight data-icon='inline-start' />
                          Resumo
                          {reviewState.pendingLabels.length ? (
                            <Badge
                              variant='outline'
                              className='ms-1 border-amber-300 px-1.5 text-[10px] text-amber-700 dark:border-amber-800 dark:text-amber-200'
                            >
                              {reviewState.pendingLabels.length}
                            </Badge>
                          ) : null}
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side='right'
                        className='w-full overflow-y-auto sm:max-w-md'
                      >
                        <SheetHeader>
                          <SheetTitle>Resumo do documento</SheetTitle>
                          <SheetDescription>
                            Status atual, próximo passo e checklist de prontidão.
                          </SheetDescription>
                        </SheetHeader>
                        <div className='space-y-6 px-4 pb-6'>
                          {renderSummaryPanel({
                            includeAssistant: currentSection.kind === 'fields',
                          })}
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* key={currentStep} dispara @starting-style do step-content-enter
                  no remount, garantindo fade+slide+blur sutil ao trocar etapa. */}
              <div key={currentStep} className='step-content-enter space-y-6'>
              {currentStep === 0 ? (
                <SetupStep
                  context={context}
                  templateIntro={template.intro}
                  errors={errors}
                  onDocTypeSelect={handleDocTypeSelect}
                  onContextChange={updateContext}
                />
              ) : currentSection.kind === 'fields' ? (
                <FieldSection
                  title={currentSection.title}
                  fields={(currentSection.fieldIds ?? []).map(
                    (fieldId) => template.fields[fieldId]
                  )}
                  values={documentData}
                  errors={errors}
                  onChange={setFieldValue}
                  onFieldBlur={handleFieldBlur}
                  onFieldFocus={handleFieldFocus}
                />
              ) : (
                <ReviewSection
                  title={context.title}
                  reviewState={reviewState}
                  sections={documentSections}
                />
              )}
              </div>
            </CardContent>
          </Card>

          {currentSection.kind === 'fields' && currentStep > 0 ? (
            <TRAIAssistant />
          ) : null}

          {currentSection.kind === 'review' ? (
            <aside
              aria-label='Resumo do documento'
              className='grid gap-6 md:grid-cols-2'
            >
              {renderSummaryPanel()}
            </aside>
          ) : null}
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
                        className='size-3.5 text-emerald-600 dark:text-emerald-400'
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
                  {submission.status === 'completed'
                    ? `${docTypeLabel(context.docType)} concluído com base no modelo selecionado.`
                    : reviewState.isReady
                      ? `Tudo pronto para concluir o ${docTypeLabel(context.docType)}.`
                      : 'Preencha os blocos obrigatórios. O checklist será atualizado automaticamente.'}
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  className='rounded-xl'
                  onClick={handleSaveDraft}
                >
                  <Save data-icon='inline-start' />
                  Salvar rascunho
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  className='rounded-xl'
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft data-icon='inline-start' />
                  Voltar
                </Button>
                {currentSection.kind === 'review' ? (
                  <Button
                    type='button'
                    className='rounded-xl'
                    onClick={handleSubmit}
                    disabled={
                      !reviewState.isReady || submission.status === 'submitting'
                    }
                    aria-busy={submission.status === 'submitting' || undefined}
                  >
                    {submission.status === 'submitting' ? (
                      <Loader2
                        data-icon='inline-start'
                        className='animate-spin-fast'
                      />
                    ) : (
                      <CheckCircle2 data-icon='inline-start' />
                    )}
                    {submission.status === 'submitting'
                      ? 'Concluindo…'
                      : `Concluir ${docTypeLabel(context.docType)}`}
                  </Button>
                ) : (
                  <Button
                    type='button'
                    className='rounded-xl'
                    onClick={handleAdvance}
                  >
                    Próxima etapa
                    <ArrowRight data-icon='inline-end' />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>

      <AlertDialog
        open={Boolean(pendingDocTypeChange)}
        onOpenChange={(open) => {
          if (!open) setPendingDocTypeChange(null)
        }}
      >
        <AlertDialogContent className='rounded-2xl'>
          <AlertDialogHeader>
            <AlertDialogTitle>Trocar o tipo de documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Trocar o tipo de documento descarta o que foi preenchido. Os
              campos comuns compatíveis são preservados; o restante é limpo.
              Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='rounded-xl'>
              Continuar editando
            </AlertDialogCancel>
            <AlertDialogAction
              className='rounded-xl'
              onClick={applyPendingDocTypeChange}
            >
              Trocar tipo de documento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const docTypeIcons: Record<
  DocType,
  React.ComponentType<{ className?: string }>
> = {
  dfd: FileText,
  etp: FileSpreadsheet,
  tr: FileCheck2,
}

function SetupStep({
  context,
  templateIntro,
  errors,
  onDocTypeSelect,
  onContextChange,
}: {
  context: {
    docType: DocType
    title: string
    responsibleUnit: string
    referenceCode: string
  }
  templateIntro: string
  errors: StepErrors
  onDocTypeSelect: (docType: DocType) => void
  onContextChange: (
    values: Partial<{
      title: string
      responsibleUnit: string
      referenceCode: string
    }>
  ) => void
}) {
  const ariaFor = (
    id: string,
    options: { description?: boolean; required?: boolean } = {}
  ) => {
    const describedBy = [
      options.description ? `${id}-desc` : null,
      errors[id] ? `${id}-error` : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined
    return {
      'aria-required': options.required || undefined,
      'aria-invalid': Boolean(errors[id]) || undefined,
      'aria-describedby': describedBy,
    } as const
  }

  return (
    <div className='space-y-6'>
      <Alert>
        <ClipboardList aria-hidden='true' className='size-4' />
        <AlertTitle>Modelo selecionado</AlertTitle>
        <AlertDescription>{templateIntro}</AlertDescription>
      </Alert>

      <Card className='rounded-2xl border-0 shadow-border'>
        <CardHeader className='space-y-1.5'>
          <p className='text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase'>
            Modelo
          </p>
          <CardTitle className='text-base'>Tipo de documento</CardTitle>
          <CardDescription>
            Escolha o documento da cadeia DFD - ETP - TR. Cada tipo abre uma
            estrutura própria de etapas e campos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            role='radiogroup'
            aria-label='Tipo de documento'
            className='grid gap-3 sm:grid-cols-3'
          >
            {docTypes.map((type) => {
              const Icon = docTypeIcons[type]
              const isSelected = context.docType === type
              return (
                <button
                  key={type}
                  type='button'
                  role='radio'
                  aria-checked={isSelected}
                  data-field-id={`docType-${type}`}
                  onClick={() => onDocTypeSelect(type)}
                  className={[
                    'group relative flex min-h-[112px] flex-col items-start gap-2 rounded-2xl border bg-background p-4 text-left transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    isSelected
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-border hover:border-primary/40',
                  ].join(' ')}
                >
                  <div className='flex w-full items-start justify-between gap-2'>
                    <span
                      className={[
                        'flex size-9 items-center justify-center rounded-lg',
                        isSelected
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      <Icon className='size-4' />
                    </span>
                    {isSelected ? (
                      <span className='flex items-center gap-1 text-xs font-medium text-primary'>
                        <Check aria-hidden='true' className='size-3.5' />
                        Selecionado
                      </span>
                    ) : null}
                  </div>
                  <div className='space-y-0.5'>
                    <span
                      translate='no'
                      className='block text-sm font-semibold tracking-tight'
                    >
                      {docTypeLabel(type)}
                    </span>
                    <span className='block text-pretty text-xs text-muted-foreground'>
                      {docTypeFullLabel(type)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className='rounded-2xl border-0 shadow-border'>
        <CardHeader className='space-y-1.5'>
          <p className='text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase'>
            Identificação
          </p>
          <CardTitle className='text-base'>Identificação básica</CardTitle>
          <CardDescription>
            Esses dados acompanham toda a jornada e aparecem na revisão final.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-6 md:grid-cols-2'>
          <FieldBlock
            label='Título do documento'
            htmlFor='title'
            error={errors.title}
            required
            description='Aparece no documento final e na fila de revisão. Use o objeto + público-alvo (ex.: "Aquisição de mobiliário para unidades de atendimento").'
          >
            <Input
              id='title'
              name='title'
              data-field-id='title'
              autoComplete='off'
              placeholder='Ex.: Aquisição de mobiliário para unidades de atendimento'
              value={context.title}
              onChange={(event) =>
                onContextChange({ title: event.target.value })
              }
              className='rounded-xl'
              {...ariaFor('title', { required: true, description: true })}
            />
          </FieldBlock>

          <FieldBlock
            label='Unidade responsável'
            htmlFor='responsibleUnit'
            error={errors.responsibleUnit}
            required
            description='Área que conduz a contratação e responde pelo documento.'
          >
            <Select
              value={context.responsibleUnit}
              onValueChange={(value) =>
                onContextChange({ responsibleUnit: value })
              }
            >
              <SelectTrigger
                id='responsibleUnit'
                name='responsibleUnit'
                data-field-id='responsibleUnit'
                className='rounded-xl'
                {...ariaFor('responsibleUnit', {
                  required: true,
                  description: true,
                })}
              >
                <SelectValue placeholder='Selecione a unidade' />
              </SelectTrigger>
              <SelectContent>
                {getResponsibleUnitOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldBlock>

          <FieldBlock
            label='Código de referência'
            htmlFor='referenceCode'
            className='md:col-span-2'
            tip='Opcional. Use o código interno usado pela sua unidade (ex.: DFD-2026-021) para facilitar o rastreamento.'
          >
            <Input
              id='referenceCode'
              name='referenceCode'
              data-field-id='referenceCode'
              autoComplete='off'
              placeholder='Ex.: DFD-2026-021'
              value={context.referenceCode}
              onChange={(event) =>
                onContextChange({ referenceCode: event.target.value })
              }
              className='rounded-xl'
              {...ariaFor('referenceCode')}
            />
          </FieldBlock>
        </CardContent>
      </Card>
    </div>
  )
}

function FieldSection({
  title,
  fields,
  values,
  errors,
  onChange,
  onFieldBlur,
  onFieldFocus,
}: {
  title: string
  fields: FieldDefinition[]
  values: Record<string, unknown>
  errors: StepErrors
  onChange: (fieldId: string, value: string) => void
  onFieldBlur?: (field: FieldDefinition, value: string) => void
  onFieldFocus?: (field: FieldDefinition) => void
}) {
  return (
    <div className='space-y-5'>
      <div className='rounded-2xl border border-black/5 bg-muted/20 px-4 py-3 text-sm text-muted-foreground dark:border-white/10'>
        {title.includes('Especificações')
          ? 'Prefira linguagem objetiva, com etapas e entregáveis separados. O review final vai refletir esses blocos com a mesma hierarquia do documento.'
          : 'Os campos abaixo alimentam a prévia consolidada e o checklist de prontidão do modelo.'}
      </div>
      <div className='grid gap-5 md:grid-cols-2'>
        {fields.map((field) => (
          <FieldRenderer
            key={field.id}
            field={field}
            value={String(values[field.id] ?? '')}
            error={errors[field.id]}
            className={field.input === 'textarea' ? 'md:col-span-2' : undefined}
            onChange={(value) => onChange(field.id, value)}
            onBlur={(value) => onFieldBlur?.(field, value)}
            onFocus={onFieldFocus}
          />
        ))}
      </div>
    </div>
  )
}

function ReviewSection({
  title,
  reviewState,
  sections,
}: {
  title: string
  reviewState: {
    isReady: boolean
    pendingLabels: string[]
  }
  sections: ReturnType<typeof buildDocumentSections>
}) {
  return (
    <div className='space-y-6'>
      {reviewState.isReady ? (
        <Alert>
          <CheckCircle2 aria-hidden='true' className='size-4' />
          <AlertTitle>Documento pronto para revisão</AlertTitle>
          <AlertDescription>
            Todos os requisitos obrigatórios do modelo oficial foram
            preenchidos.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant='destructive'>
          <AlertCircle aria-hidden='true' className='size-4' />
          <AlertTitle>Checklist com pendências</AlertTitle>
          <AlertDescription>
            Revise os itens em aberto antes de enviar para revisão formal.
          </AlertDescription>
        </Alert>
      )}

      <TRDocumentView
        title={title || 'TR sem título'}
        sections={sections}
        status={{
          label: reviewState.isReady
            ? 'Pronto para envio'
            : `${reviewState.pendingLabels.length} pendência(s) em aberto`,
          tone: reviewState.isReady ? 'success' : 'warning',
        }}
      />
    </div>
  )
}

function FieldRenderer({
  field,
  value,
  error,
  className,
  onChange,
  onBlur,
  onFocus,
}: {
  field: FieldDefinition
  value: string
  error?: string
  className?: string
  onChange: (value: string) => void
  onBlur?: (value: string) => void
  onFocus?: (field: FieldDefinition) => void
}) {
  const describedBy = [
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

  return (
    <FieldBlock
      label={field.label}
      htmlFor={field.id}
      error={error}
      className={className}
      description={field.description}
      required={field.required}
    >
      {field.input === 'select' ? (
        <Select
          value={value}
          onValueChange={(next) => {
            onChange(next)
            onBlur?.(next)
          }}
        >
          <SelectTrigger
            id={field.id}
            name={field.id}
            data-field-id={field.id}
            className='rounded-xl'
            onFocus={() => onFocus?.(field)}
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
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={(event) => onBlur?.(event.target.value)}
          onFocus={() => onFocus?.(field)}
          className='min-h-32 rounded-2xl'
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
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={(event) => onBlur?.(event.target.value)}
          onFocus={() => onFocus?.(field)}
          className='rounded-xl'
          {...ariaProps}
        />
      )}
    </FieldBlock>
  )
}

function FieldBlock({
  label,
  htmlFor,
  error,
  className,
  description,
  children,
  required,
  tip,
}: {
  label: string
  htmlFor?: string
  error?: string
  className?: string
  description?: string
  children: React.ReactNode
  required?: boolean
  tip?: string
}) {
  return (
    <div className={['grid gap-2', className].filter(Boolean).join(' ')}>
      <div className='flex items-center gap-1.5'>
        <Label htmlFor={htmlFor} className='text-sm font-medium'>
          {label}
          {required ? (
            <span aria-hidden='true' className='ms-0.5 text-destructive'>
              *
            </span>
          ) : null}
          {required ? <span className='sr-only'> (obrigatório)</span> : null}
        </Label>
        {tip ? (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  aria-label={`Ajuda sobre ${label}`}
                  className='relative size-6 rounded-full text-muted-foreground after:absolute after:inset-[-6px] after:content-[""] hover:text-foreground'
                >
                  <HelpCircle className='size-3.5' aria-hidden='true' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='top' className='max-w-xs'>
                {tip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
      {children}
      {description ? (
        <p
          id={htmlFor ? `${htmlFor}-desc` : undefined}
          className='text-xs text-muted-foreground'
        >
          {description}
        </p>
      ) : null}
      {error ? (
        <p
          id={htmlFor ? `${htmlFor}-error` : undefined}
          role='status'
          className='field-error text-sm text-destructive'
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

function validateCurrentStep(
  section: SectionDefinition,
  context: {
    title: string
    responsibleUnit: string
    referenceCode: string
  },
  documentData: Record<string, unknown>,
  template: ReturnType<typeof getModelForDocType>
) {
  const nextErrors: StepErrors = {}

  if (section.id === 'setup') {
    if (!context.title.trim()) nextErrors.title = 'Informe o título do documento.'
    if (!context.responsibleUnit.trim()) {
      nextErrors.responsibleUnit = 'Informe a unidade responsável.'
    }
  }

  if (section.kind === 'fields') {
    ;(section.fieldIds ?? []).forEach((fieldId) => {
      const field = template.fields[fieldId]
      if (!field?.required) return
      const value = String(documentData[field.id] ?? '').trim()
      if (!value) {
        nextErrors[field.id] = `Preencha o campo "${field.label}".`
        return
      }

      if (
        field.input === 'email' &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        nextErrors[field.id] = 'Informe um e-mail válido.'
      }
    })
  }

  return nextErrors
}

function validateSingleField(
  field: FieldDefinition,
  value: string
): string | undefined {
  if (!field.required) return undefined
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return `Preencha o campo "${field.label}".`
  if (
    field.input === 'email' &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
  ) {
    return 'Informe um e-mail válido.'
  }
  return undefined
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
