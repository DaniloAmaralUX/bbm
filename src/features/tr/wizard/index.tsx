import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  FileText,
  HelpCircle,
  Loader2,
  PanelRight,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { Textarea } from '@/shared/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import {
  type TRDeliveryLocation,
  type TRFieldDefinition,
  type TRInstitution,
  type TRLot,
  type TRLotItem,
  type TRSectionDefinition,
  type TRTemplateType,
  buildDocumentSections,
  getDefaultTemplateForInstitution,
  getInstitutionOptions,
  getResponsibleUnitOptions,
  getTemplateDefinition,
  getTemplateOptions,
} from '@/features/tr/data/templates'
import { TRMetaList } from '@/shared/components/tr-meta-list'
import { TRDocumentView } from '@/features/tr/view/components/tr-document-view'
import { trs } from '@/features/tr/data/trs'
import { TRAIAssistant } from './components/tr-ai-assistant'
import { TRStepper } from './components/tr-stepper'
import { useTRWizard } from './store/use-tr-wizard'

type StepErrors = Record<string, string>

type PendingTemplateChange = {
  institution: TRInstitution
  templateType: TRTemplateType
}

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
    changeTemplate,
    setFieldValue,
    addLot,
    removeLot,
    updateLot,
    addLotItem,
    updateLotItem,
    removeLotItem,
    addDeliveryLocation,
    updateDeliveryLocation,
    removeDeliveryLocation,
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

  const template = getTemplateDefinition(
    context.institution,
    context.templateType
  )
  const wizardSteps = useMemo<TRSectionDefinition[]>(
    () => [
      {
        id: 'setup',
        title: 'Configuração do Modelo',
        description:
          'Escolha instituição, modelo oficial e identificação básica do documento.',
        kind: 'fields',
        fieldIds: [],
      },
      ...template.sections,
    ],
    [template]
  )
  const currentSection = wizardSteps[currentStep]
  const templateOptions = getTemplateOptions(context.institution)
  const errorScope = `${currentStep}:${context.institution}:${context.templateType}`
  const [stepErrorState, setStepErrorState] = useState<StepErrorState>({
    scope: '',
    values: {},
  })
  const [pendingTemplateChange, setPendingTemplateChange] =
    useState<PendingTemplateChange | null>(null)

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
          let count = 0
          if (!context.institution) count += 1
          if (!context.templateType) count += 1
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
        if (section.kind === 'lots') {
          const lots = (documentData.lots as TRLot[] | undefined) ?? []
          if (lots.length === 0) return 1
          let count = 0
          lots.forEach((lot) => {
            if (!lot.number.trim()) count += 1
            if (!lot.name.trim()) count += 1
            lot.items.forEach((item) => {
              if (!item.location.trim()) count += 1
              if (!item.itemCode.trim()) count += 1
              if (!item.summary.trim()) count += 1
              if (!item.unitMeasure.trim()) count += 1
              if (!item.quantity.trim()) count += 1
              if (!item.delivery.trim()) count += 1
            })
          })
          return count
        }
        if (section.kind === 'deliveries') {
          const deliveries =
            (documentData.deliveries as TRDeliveryLocation[] | undefined) ?? []
          if (deliveries.length === 0) return 1
          let count = 0
          deliveries.forEach((delivery) => {
            if (!delivery.institutionUnit.trim()) count += 1
            if (!delivery.cnpj.trim()) count += 1
            if (!delivery.address.trim()) count += 1
          })
          return count
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
    params.set('institution', context.institution)
    params.set('model', context.templateType)
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}?${params.toString()}`
    )
  }, [currentStep, context.institution, context.templateType])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem('tr-wizard-onboarded')) return

    toast('Bem-vindo à Fase Preparatória', {
      description:
        'Comece pela Configuração: escolha a instituição, o modelo oficial e dê um título à TR. O wizard guia o resto.',
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

      toast.error('Preencha os campos obrigatórios antes de aprovar.')
      return
    }

    startSubmission()
    completeSubmission()
    toast.success('TR aprovada.')
  }

  useEffect(() => {
    // Limpa target da IA ao trocar de etapa
    setAssistantTarget(null)
  }, [currentStep, setAssistantTarget])

  const handleFieldFocus = (field: TRFieldDefinition) => {
    if (currentStep === 0) return
    if (currentSection.kind !== 'fields') return
    setAssistantTarget({
      fieldId: field.id,
      sectionId: currentSection.id,
    })
  }

  const handleFieldBlur = (field: TRFieldDefinition, value: string) => {
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

  const queueTemplateChange = (
    institution: TRInstitution,
    templateType: TRTemplateType
  ) => {
    const isChanging =
      institution !== context.institution ||
      templateType !== context.templateType

    if (!isChanging) return

    if (!isDirty) {
      changeTemplate(institution, templateType)
      return
    }

    setPendingTemplateChange({ institution, templateType })
  }

  const handleInstitutionChange = (value: string) => {
    const institution = value as TRInstitution
    const nextTemplateType = getDefaultTemplateForInstitution(institution)
    queueTemplateChange(institution, nextTemplateType)
  }

  const handleTemplateChange = (value: string) => {
    queueTemplateChange(context.institution, value as TRTemplateType)
  }

  const applyPendingTemplateChange = () => {
    if (!pendingTemplateChange) return
    changeTemplate(
      pendingTemplateChange.institution,
      pendingTemplateChange.templateType
    )
    setPendingTemplateChange(null)
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
                label: 'Modelo institucional',
                valueNode: (
                  <>
                    <span translate='no'>{context.institution}</span>
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
                Criação de TR com modelos oficiais
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
                  templateOptions={templateOptions}
                  errors={errors}
                  onInstitutionChange={handleInstitutionChange}
                  onTemplateChange={handleTemplateChange}
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
              ) : currentSection.kind === 'lots' ? (
                <LotsSection
                  lots={(documentData.lots as TRLot[] | undefined) ?? []}
                  errors={errors}
                  onAddLot={addLot}
                  onRemoveLot={removeLot}
                  onUpdateLot={updateLot}
                  onAddLotItem={addLotItem}
                  onUpdateLotItem={updateLotItem}
                  onRemoveLotItem={removeLotItem}
                />
              ) : currentSection.kind === 'deliveries' ? (
                <DeliveriesSection
                  deliveries={
                    (documentData.deliveries as
                      | TRDeliveryLocation[]
                      | undefined) ?? []
                  }
                  errors={errors}
                  onAddDelivery={addDeliveryLocation}
                  onUpdateDelivery={updateDeliveryLocation}
                  onRemoveDelivery={removeDeliveryLocation}
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
                    ? 'TR aprovado com base no modelo oficial selecionado.'
                    : reviewState.isReady
                      ? 'Tudo pronto para aprovar e finalizar o TR.'
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
                      ? 'Aprovando…'
                      : 'Aprovar TR'}
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
        open={Boolean(pendingTemplateChange)}
        onOpenChange={(open) => {
          if (!open) setPendingTemplateChange(null)
        }}
      >
        <AlertDialogContent className='rounded-2xl'>
          <AlertDialogHeader>
            <AlertDialogTitle>Trocar instituição ou modelo?</AlertDialogTitle>
            <AlertDialogDescription>
              O wizard preserva apenas os campos compatíveis entre os modelos.
              Os dados específicos do modelo atual podem ser limpos nessa troca.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='rounded-xl'>
              Continuar editando
            </AlertDialogCancel>
            <AlertDialogAction
              className='rounded-xl'
              onClick={applyPendingTemplateChange}
            >
              Trocar modelo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function SetupStep({
  context,
  templateIntro,
  templateOptions,
  errors,
  onInstitutionChange,
  onTemplateChange,
  onContextChange,
}: {
  context: {
    institution: TRInstitution
    templateType: string
    title: string
    responsibleUnit: string
    referenceCode: string
  }
  templateIntro: string
  templateOptions: Array<{ label: string; value: string }>
  errors: StepErrors
  onInstitutionChange: (value: string) => void
  onTemplateChange: (value: string) => void
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

      <div className='grid gap-6 md:grid-cols-2'>
        <Card className='rounded-2xl border-0 shadow-border'>
          <CardHeader className='space-y-1.5'>
            <p className='text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase'>
              Modelo
            </p>
            <CardTitle className='text-base'>Estrutura do documento</CardTitle>
            <CardDescription>
              Defina a família institucional e a forma oficial do TR antes do
              preenchimento.
            </CardDescription>
          </CardHeader>
          <CardContent className='grid gap-6 md:grid-cols-2'>
            <FieldBlock
              label='Instituição'
              htmlFor='institution'
              error={errors.institution}
              required
            >
              <Select
                value={context.institution}
                onValueChange={onInstitutionChange}
              >
                <SelectTrigger
                  id='institution'
                  name='institution'
                  data-field-id='institution'
                  className='rounded-xl'
                  {...ariaFor('institution', { required: true })}
                >
                  <SelectValue placeholder='Selecione a instituição' />
                </SelectTrigger>
                <SelectContent>
                  {getInstitutionOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldBlock>

            <FieldBlock
              label='Modelo oficial'
              htmlFor='templateType'
              error={errors.templateType}
              required
              tip='Cada modelo (consultoria, capacitações, locação, etc.) abre uma estrutura diferente de etapas e campos obrigatórios. Você pode trocar depois, mas dados específicos podem ser perdidos.'
            >
              <Select
                value={context.templateType}
                onValueChange={onTemplateChange}
              >
                <SelectTrigger
                  id='templateType'
                  name='templateType'
                  data-field-id='templateType'
                  className='rounded-xl'
                  {...ariaFor('templateType', { required: true })}
                >
                  <SelectValue placeholder='Selecione o modelo' />
                </SelectTrigger>
                <SelectContent>
                  {templateOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldBlock>
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
          <CardContent className='grid gap-6'>
            <FieldBlock
              label='Título da TR'
              htmlFor='title'
              error={errors.title}
              required
              description='Aparece no documento final e na fila de revisão. Use o objeto + público-alvo (ex.: "Consultoria para internacionalização industrial").'
            >
              <Input
                id='title'
                name='title'
                data-field-id='title'
                autoComplete='off'
                placeholder='Ex.: Consultoria para internacionalização industrial'
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
              description='Área que conduz a contratação e responde pelo TR.'
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
              tip='Opcional. Use o código interno usado pela sua unidade (ex.: TR-2026-021) para facilitar o rastreamento.'
            >
              <Input
                id='referenceCode'
                name='referenceCode'
                data-field-id='referenceCode'
                autoComplete='off'
                placeholder='Ex.: TR-2026-021'
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
  fields: TRFieldDefinition[]
  values: Record<string, unknown>
  errors: StepErrors
  onChange: (fieldId: string, value: string) => void
  onFieldBlur?: (field: TRFieldDefinition, value: string) => void
  onFieldFocus?: (field: TRFieldDefinition) => void
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

function LotsSection({
  lots,
  errors,
  onAddLot,
  onRemoveLot,
  onUpdateLot,
  onAddLotItem,
  onUpdateLotItem,
  onRemoveLotItem,
}: {
  lots: TRLot[]
  errors: StepErrors
  onAddLot: () => void
  onRemoveLot: (lotId: string) => void
  onUpdateLot: (
    lotId: string,
    values: Partial<Omit<TRLot, 'items' | 'id'>>
  ) => void
  onAddLotItem: (lotId: string) => void
  onUpdateLotItem: (
    lotId: string,
    itemId: string,
    values: Partial<Omit<TRLotItem, 'id'>>
  ) => void
  onRemoveLotItem: (lotId: string, itemId: string) => void
}) {
  return (
    <div className='space-y-5'>
      <Alert>
        <ClipboardList aria-hidden='true' className='size-4' />
        <AlertTitle>Matriz principal do SESI</AlertTitle>
        <AlertDescription>
          Cada linha deve reproduzir a lógica do TR oficial: lote,
          unidade/endereço, item, especificação, unidade, quantidade total e
          entrega.
        </AlertDescription>
      </Alert>

      {lots.map((lot, index) => (
        <Card
          key={lot.id}
          className='rounded-2xl border-0 shadow-border'
        >
          <CardHeader>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div>
                <CardTitle className='text-base'>Lote {index + 1}</CardTitle>
                <CardDescription>
                  Identifique o lote e estruture os itens vinculados a ele.
                </CardDescription>
              </div>
              <Button
                type='button'
                variant='outline'
                onClick={() => onRemoveLot(lot.id)}
              >
                <Trash2 data-icon='inline-start' />
                Remover lote
              </Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-5'>
            <div className='grid gap-4 md:grid-cols-2'>
              <FieldBlock
                label='Nº lote'
                htmlFor={`lot-${lot.id}-number`}
                error={errors[`lot-${lot.id}-number`]}
              >
                <Input
                  id={`lot-${lot.id}-number`}
                  name={`lot-${lot.id}-number`}
                  data-field-id={`lot-${lot.id}-number`}
                  autoComplete='off'
                  placeholder='Ex.: 01'
                  value={lot.number}
                  onChange={(event) =>
                    onUpdateLot(lot.id, { number: event.target.value })
                  }
                  className='rounded-xl'
                />
              </FieldBlock>
              <FieldBlock
                label='Lote'
                htmlFor={`lot-${lot.id}-name`}
                error={errors[`lot-${lot.id}-name`]}
              >
                <Input
                  id={`lot-${lot.id}-name`}
                  name={`lot-${lot.id}-name`}
                  data-field-id={`lot-${lot.id}-name`}
                  autoComplete='off'
                  placeholder='Ex.: Armário expositor'
                  value={lot.name}
                  onChange={(event) =>
                    onUpdateLot(lot.id, { name: event.target.value })
                  }
                  className='rounded-xl'
                />
              </FieldBlock>
            </div>

            <div className='hidden overflow-x-auto rounded-2xl border border-border/70 lg:block'>
              <Table className='min-w-[1100px]'>
                <TableHeader>
                  <TableRow>
                    <TableHead className='min-w-[200px]'>
                      Unidade/Endereço
                    </TableHead>
                    <TableHead className='min-w-[120px]'>Item</TableHead>
                    <TableHead className='min-w-[260px]'>
                      Especificação resumida
                    </TableHead>
                    <TableHead className='min-w-[150px]'>
                      Unidade de medida
                    </TableHead>
                    <TableHead className='min-w-[120px]'>Qtd. total</TableHead>
                    <TableHead className='min-w-[180px]'>Entrega</TableHead>
                    <TableHead className='w-[120px]'>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lot.items.map((item, itemIndex) => {
                    const rowRef = `lote ${index + 1}, item ${itemIndex + 1}`
                    return (
                    <TableRow key={item.id}>
                      <TableCell className='align-top whitespace-normal'>
                        <Input
                          id={`lot-${lot.id}-item-${item.id}-location`}
                          name={`lot-${lot.id}-item-${item.id}-location`}
                          data-field-id={`lot-${lot.id}-item-${item.id}-location`}
                          autoComplete='street-address'
                          placeholder='Unidade ou endereço…'
                          aria-label={`Unidade ou endereço — ${rowRef}`}
                          value={item.location}
                          onChange={(event) =>
                            onUpdateLotItem(lot.id, item.id, {
                              location: event.target.value,
                            })
                          }
                        />
                        {errors[`lot-${lot.id}-item-${item.id}-location`] ? (
                          <p className='field-error mt-2 text-sm text-destructive'>
                            {errors[`lot-${lot.id}-item-${item.id}-location`]}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className='align-top whitespace-normal'>
                        <Input
                          id={`lot-${lot.id}-item-${item.id}-itemCode`}
                          name={`lot-${lot.id}-item-${item.id}-itemCode`}
                          data-field-id={`lot-${lot.id}-item-${item.id}-itemCode`}
                          autoComplete='off'
                          placeholder='Ex.: 1'
                          aria-label={`Código do item — ${rowRef}`}
                          value={item.itemCode}
                          onChange={(event) =>
                            onUpdateLotItem(lot.id, item.id, {
                              itemCode: event.target.value,
                            })
                          }
                        />
                        {errors[`lot-${lot.id}-item-${item.id}-itemCode`] ? (
                          <p className='field-error mt-2 text-sm text-destructive'>
                            {errors[`lot-${lot.id}-item-${item.id}-itemCode`]}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className='align-top whitespace-normal'>
                        <Textarea
                          id={`lot-${lot.id}-item-${item.id}-summary`}
                          name={`lot-${lot.id}-item-${item.id}-summary`}
                          data-field-id={`lot-${lot.id}-item-${item.id}-summary`}
                          autoComplete='off'
                          placeholder='Descreva o item…'
                          aria-label={`Especificação resumida — ${rowRef}`}
                          value={item.summary}
                          onChange={(event) =>
                            onUpdateLotItem(lot.id, item.id, {
                              summary: event.target.value,
                            })
                          }
                          className='min-h-24 rounded-2xl'
                        />
                        {errors[`lot-${lot.id}-item-${item.id}-summary`] ? (
                          <p className='field-error mt-2 text-sm text-destructive'>
                            {errors[`lot-${lot.id}-item-${item.id}-summary`]}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className='align-top whitespace-normal'>
                        <Input
                          id={`lot-${lot.id}-item-${item.id}-unitMeasure`}
                          name={`lot-${lot.id}-item-${item.id}-unitMeasure`}
                          data-field-id={`lot-${lot.id}-item-${item.id}-unitMeasure`}
                          autoComplete='off'
                          placeholder='Ex.: unidade'
                          aria-label={`Unidade de medida — ${rowRef}`}
                          value={item.unitMeasure}
                          onChange={(event) =>
                            onUpdateLotItem(lot.id, item.id, {
                              unitMeasure: event.target.value,
                            })
                          }
                        />
                        {errors[`lot-${lot.id}-item-${item.id}-unitMeasure`] ? (
                          <p className='field-error mt-2 text-sm text-destructive'>
                            {
                              errors[
                                `lot-${lot.id}-item-${item.id}-unitMeasure`
                              ]
                            }
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className='align-top whitespace-normal'>
                        <Input
                          id={`lot-${lot.id}-item-${item.id}-quantity`}
                          name={`lot-${lot.id}-item-${item.id}-quantity`}
                          data-field-id={`lot-${lot.id}-item-${item.id}-quantity`}
                          autoComplete='off'
                          inputMode='numeric'
                          placeholder='0'
                          aria-label={`Quantidade total — ${rowRef}`}
                          value={item.quantity}
                          onChange={(event) =>
                            onUpdateLotItem(lot.id, item.id, {
                              quantity: event.target.value,
                            })
                          }
                        />
                        {errors[`lot-${lot.id}-item-${item.id}-quantity`] ? (
                          <p className='field-error mt-2 text-sm text-destructive'>
                            {errors[`lot-${lot.id}-item-${item.id}-quantity`]}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className='align-top whitespace-normal'>
                        <Input
                          id={`lot-${lot.id}-item-${item.id}-delivery`}
                          name={`lot-${lot.id}-item-${item.id}-delivery`}
                          data-field-id={`lot-${lot.id}-item-${item.id}-delivery`}
                          autoComplete='off'
                          placeholder='Prazo ou condição…'
                          aria-label={`Entrega — ${rowRef}`}
                          value={item.delivery}
                          onChange={(event) =>
                            onUpdateLotItem(lot.id, item.id, {
                              delivery: event.target.value,
                            })
                          }
                        />
                        {errors[`lot-${lot.id}-item-${item.id}-delivery`] ? (
                          <p className='field-error mt-2 text-sm text-destructive'>
                            {errors[`lot-${lot.id}-item-${item.id}-delivery`]}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className='align-top'>
                        <Button
                          type='button'
                          variant='ghost'
                          onClick={() => onRemoveLotItem(lot.id, item.id)}
                          aria-label={`Remover ${rowRef}`}
                        >
                          <Trash2 aria-hidden='true' data-icon='inline-start' />
                          Remover
                        </Button>
                      </TableCell>
                    </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <ol
              className='stagger-fade-in space-y-3 lg:hidden'
              aria-label={`Itens do lote ${index + 1}`}
            >
              {lot.items.map((item, itemIndex) => (
                <li key={item.id}>
                  <Card className='rounded-2xl border-border/70'>
                    <CardHeader className='flex-row items-center justify-between space-y-0 pb-3'>
                      <CardTitle className='text-sm font-semibold'>
                        Item {itemIndex + 1}
                      </CardTitle>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => onRemoveLotItem(lot.id, item.id)}
                        aria-label={`Remover item ${itemIndex + 1} do lote ${index + 1}`}
                        className='relative after:absolute after:inset-[-4px] after:content-[""]'
                      >
                        <Trash2 data-icon='inline-start' />
                        Remover
                      </Button>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <FieldBlock
                        label='Unidade/Endereço'
                        htmlFor={`lot-${lot.id}-item-${item.id}-location-m`}
                        error={errors[`lot-${lot.id}-item-${item.id}-location`]}
                      >
                        <Input
                          id={`lot-${lot.id}-item-${item.id}-location-m`}
                          name={`lot-${lot.id}-item-${item.id}-location-m`}
                          autoComplete='street-address'
                          placeholder='Unidade ou endereço…'
                          value={item.location}
                          onChange={(event) =>
                            onUpdateLotItem(lot.id, item.id, {
                              location: event.target.value,
                            })
                          }
                          className='rounded-xl'
                        />
                      </FieldBlock>
                      <FieldBlock
                        label='Item'
                        htmlFor={`lot-${lot.id}-item-${item.id}-itemCode-m`}
                        error={errors[`lot-${lot.id}-item-${item.id}-itemCode`]}
                      >
                        <Input
                          id={`lot-${lot.id}-item-${item.id}-itemCode-m`}
                          name={`lot-${lot.id}-item-${item.id}-itemCode-m`}
                          autoComplete='off'
                          placeholder='Ex.: 1'
                          value={item.itemCode}
                          onChange={(event) =>
                            onUpdateLotItem(lot.id, item.id, {
                              itemCode: event.target.value,
                            })
                          }
                          className='rounded-xl'
                        />
                      </FieldBlock>
                      <FieldBlock
                        label='Especificação resumida'
                        htmlFor={`lot-${lot.id}-item-${item.id}-summary-m`}
                        error={errors[`lot-${lot.id}-item-${item.id}-summary`]}
                      >
                        <Textarea
                          id={`lot-${lot.id}-item-${item.id}-summary-m`}
                          name={`lot-${lot.id}-item-${item.id}-summary-m`}
                          autoComplete='off'
                          placeholder='Descreva o item…'
                          value={item.summary}
                          onChange={(event) =>
                            onUpdateLotItem(lot.id, item.id, {
                              summary: event.target.value,
                            })
                          }
                          className='min-h-24 rounded-2xl'
                        />
                      </FieldBlock>
                      <div className='grid gap-4 sm:grid-cols-2'>
                        <FieldBlock
                          label='Unidade de medida'
                          htmlFor={`lot-${lot.id}-item-${item.id}-unitMeasure-m`}
                          error={
                            errors[`lot-${lot.id}-item-${item.id}-unitMeasure`]
                          }
                        >
                          <Input
                            id={`lot-${lot.id}-item-${item.id}-unitMeasure-m`}
                            name={`lot-${lot.id}-item-${item.id}-unitMeasure-m`}
                            autoComplete='off'
                            placeholder='Ex.: unidade'
                            value={item.unitMeasure}
                            onChange={(event) =>
                              onUpdateLotItem(lot.id, item.id, {
                                unitMeasure: event.target.value,
                              })
                            }
                            className='rounded-xl'
                          />
                        </FieldBlock>
                        <FieldBlock
                          label='Qtd. total'
                          htmlFor={`lot-${lot.id}-item-${item.id}-quantity-m`}
                          error={errors[`lot-${lot.id}-item-${item.id}-quantity`]}
                        >
                          <Input
                            id={`lot-${lot.id}-item-${item.id}-quantity-m`}
                            name={`lot-${lot.id}-item-${item.id}-quantity-m`}
                            autoComplete='off'
                            inputMode='numeric'
                            placeholder='0'
                            value={item.quantity}
                            onChange={(event) =>
                              onUpdateLotItem(lot.id, item.id, {
                                quantity: event.target.value,
                              })
                            }
                            className='rounded-xl'
                          />
                        </FieldBlock>
                      </div>
                      <FieldBlock
                        label='Entrega'
                        htmlFor={`lot-${lot.id}-item-${item.id}-delivery-m`}
                        error={errors[`lot-${lot.id}-item-${item.id}-delivery`]}
                      >
                        <Input
                          id={`lot-${lot.id}-item-${item.id}-delivery-m`}
                          name={`lot-${lot.id}-item-${item.id}-delivery-m`}
                          autoComplete='off'
                          placeholder='Prazo ou condição…'
                          value={item.delivery}
                          onChange={(event) =>
                            onUpdateLotItem(lot.id, item.id, {
                              delivery: event.target.value,
                            })
                          }
                          className='rounded-xl'
                        />
                      </FieldBlock>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>

            <Button
              type='button'
              variant='outline'
              onClick={() => onAddLotItem(lot.id)}
            >
              <Plus data-icon='inline-start' />
              Adicionar item ao lote
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button type='button' variant='outline' onClick={onAddLot}>
        <Plus data-icon='inline-start' />
        Adicionar novo lote
      </Button>
    </div>
  )
}

function DeliveriesSection({
  deliveries,
  errors,
  onAddDelivery,
  onUpdateDelivery,
  onRemoveDelivery,
}: {
  deliveries: TRDeliveryLocation[]
  errors: StepErrors
  onAddDelivery: () => void
  onUpdateDelivery: (
    deliveryId: string,
    values: Partial<Omit<TRDeliveryLocation, 'id'>>
  ) => void
  onRemoveDelivery: (deliveryId: string) => void
}) {
  return (
    <div className='space-y-5'>
      <Alert>
        <FileText aria-hidden='true' className='size-4' />
        <AlertTitle>Tabela auxiliar de instituições</AlertTitle>
        <AlertDescription>
          Cadastre as unidades com CNPJ e endereço oficial. Essa tabela
          complementa a matriz de lotes, sem substituí-la.
        </AlertDescription>
      </Alert>

      <div className='stagger-fade-in space-y-5'>
      {deliveries.map((delivery, index) => (
        <Card
          key={delivery.id}
          className='rounded-2xl border-0 shadow-border'
        >
          <CardHeader>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div>
                <CardTitle className='text-base'>
                  Instituição/Unidade {index + 1}
                </CardTitle>
                <CardDescription>
                  Informe a unidade atendida, CNPJ e endereço de
                  entrega/fornecimento.
                </CardDescription>
              </div>
              <Button
                type='button'
                variant='outline'
                onClick={() => onRemoveDelivery(delivery.id)}
                aria-label={`Remover instituição/unidade ${index + 1}`}
              >
                <Trash2 aria-hidden='true' data-icon='inline-start' />
                Remover
              </Button>
            </div>
          </CardHeader>
          <CardContent className='grid gap-4 md:grid-cols-2'>
            <FieldBlock
              label='Instituição/Unidade'
              htmlFor={`delivery-${delivery.id}-institutionUnit`}
              error={errors[`delivery-${delivery.id}-institutionUnit`]}
            >
              <Input
                id={`delivery-${delivery.id}-institutionUnit`}
                name={`delivery-${delivery.id}-institutionUnit`}
                data-field-id={`delivery-${delivery.id}-institutionUnit`}
                autoComplete='organization'
                placeholder='Ex.: SESI Paulista'
                value={delivery.institutionUnit}
                onChange={(event) =>
                  onUpdateDelivery(delivery.id, {
                    institutionUnit: event.target.value,
                  })
                }
                className='rounded-xl'
              />
            </FieldBlock>

            <FieldBlock
              label='CNPJ'
              htmlFor={`delivery-${delivery.id}-cnpj`}
              error={errors[`delivery-${delivery.id}-cnpj`]}
              description='Formato 00.000.000/0000-00'
            >
              <Input
                id={`delivery-${delivery.id}-cnpj`}
                name={`delivery-${delivery.id}-cnpj`}
                data-field-id={`delivery-${delivery.id}-cnpj`}
                autoComplete='off'
                inputMode='numeric'
                maxLength={18}
                placeholder='00.000.000/0000-00'
                value={delivery.cnpj}
                onChange={(event) =>
                  onUpdateDelivery(delivery.id, {
                    cnpj: event.target.value,
                  })
                }
                className='rounded-xl'
                aria-describedby={`delivery-${delivery.id}-cnpj-desc${errors[`delivery-${delivery.id}-cnpj`] ? ` delivery-${delivery.id}-cnpj-error` : ''}`}
              />
            </FieldBlock>

            <FieldBlock
              label='Endereço'
              htmlFor={`delivery-${delivery.id}-address`}
              error={errors[`delivery-${delivery.id}-address`]}
              className='md:col-span-2'
            >
              <Textarea
                id={`delivery-${delivery.id}-address`}
                name={`delivery-${delivery.id}-address`}
                data-field-id={`delivery-${delivery.id}-address`}
                autoComplete='street-address'
                placeholder='Rua, número, complemento e referência…'
                value={delivery.address}
                onChange={(event) =>
                  onUpdateDelivery(delivery.id, {
                    address: event.target.value,
                  })
                }
                className='min-h-24 rounded-2xl'
              />
            </FieldBlock>
          </CardContent>
        </Card>
      ))}
      </div>

      <Button type='button' variant='outline' onClick={onAddDelivery}>
        <Plus data-icon='inline-start' />
        Adicionar instituição/unidade
      </Button>
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
  field: TRFieldDefinition
  value: string
  error?: string
  className?: string
  onChange: (value: string) => void
  onBlur?: (value: string) => void
  onFocus?: (field: TRFieldDefinition) => void
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
  section: TRSectionDefinition,
  context: {
    title: string
    responsibleUnit: string
    templateType: string
    institution: string
    referenceCode: string
  },
  documentData: Record<string, unknown>,
  template: ReturnType<typeof getTemplateDefinition>
) {
  const nextErrors: StepErrors = {}

  if (section.id === 'setup') {
    if (!context.institution)
      nextErrors.institution = 'Selecione a instituição.'
    if (!context.templateType)
      nextErrors.templateType = 'Selecione o tipo de TR.'
    if (!context.title.trim()) nextErrors.title = 'Informe o título da TR.'
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

  if (section.kind === 'lots') {
    const lots = (documentData.lots as TRLot[] | undefined) ?? []
    if (!lots.length) nextErrors.lots = 'Adicione ao menos um lote.'

    lots.forEach((lot) => {
      if (!lot.number.trim())
        nextErrors[`lot-${lot.id}-number`] = 'Informe o número do lote.'
      if (!lot.name.trim())
        nextErrors[`lot-${lot.id}-name`] = 'Informe o nome do lote.'

      lot.items.forEach((item) => {
        if (!item.location.trim()) {
          nextErrors[`lot-${lot.id}-item-${item.id}-location`] =
            'Informe a unidade ou o endereço.'
        }
        if (!item.itemCode.trim()) {
          nextErrors[`lot-${lot.id}-item-${item.id}-itemCode`] =
            'Informe o item.'
        }
        if (!item.summary.trim()) {
          nextErrors[`lot-${lot.id}-item-${item.id}-summary`] =
            'Descreva o item.'
        }
        if (!item.unitMeasure.trim()) {
          nextErrors[`lot-${lot.id}-item-${item.id}-unitMeasure`] =
            'Informe a unidade de medida.'
        }
        if (!item.quantity.trim()) {
          nextErrors[`lot-${lot.id}-item-${item.id}-quantity`] =
            'Informe a quantidade total.'
        }
        if (!item.delivery.trim()) {
          nextErrors[`lot-${lot.id}-item-${item.id}-delivery`] =
            'Informe a entrega.'
        }
      })
    })
  }

  if (section.kind === 'deliveries') {
    const deliveries =
      (documentData.deliveries as TRDeliveryLocation[] | undefined) ?? []
    if (!deliveries.length) {
      nextErrors.deliveries = 'Adicione ao menos uma instituição/unidade.'
    }

    deliveries.forEach((delivery) => {
      if (!delivery.institutionUnit.trim()) {
        nextErrors[`delivery-${delivery.id}-institutionUnit`] =
          'Informe a instituição ou unidade.'
      }
      if (!delivery.cnpj.trim()) {
        nextErrors[`delivery-${delivery.id}-cnpj`] = 'Informe o CNPJ.'
      }
      if (!delivery.address.trim()) {
        nextErrors[`delivery-${delivery.id}-address`] = 'Informe o endereço.'
      }
    })
  }

  return nextErrors
}

function validateSingleField(
  field: TRFieldDefinition,
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
