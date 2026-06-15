import { useMemo, useState } from 'react'
import {
  Copy,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { toast } from 'sonner'
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
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  type TRAssistantAction,
  getFieldSupport,
  trAssistantActionDescriptions,
  trAssistantActionLabels,
} from '@/features/documents/data/tr-assistant'
import {
  getModelForDocType,
  type FieldDefinition,
} from '@/features/documents/data/templates'
import { docTypeLabel } from '@/features/documents/data/doc-type'
import { useTRWizard } from '../store/use-tr-wizard'

const actionIcons: Record<TRAssistantAction, React.ComponentType<{ className?: string }>> = {
  suggest: Wand2,
  expand: Sparkles,
  rewrite: RefreshCcw,
}

const actionOrder: TRAssistantAction[] = ['suggest', 'expand', 'rewrite']

export function TRAIAssistant() {
  const assistant = useTRWizard((state) => state.assistant)
  const context = useTRWizard((state) => state.context)
  const documentData = useTRWizard((state) => state.documentData)
  const requestAssistantSuggestion = useTRWizard(
    (state) => state.requestAssistantSuggestion
  )
  const applyAssistantSuggestion = useTRWizard(
    (state) => state.applyAssistantSuggestion
  )
  const discardAssistantSuggestion = useTRWizard(
    (state) => state.discardAssistantSuggestion
  )

  const [confirmOverwrite, setConfirmOverwrite] = useState(false)

  const template = useMemo(
    () => getModelForDocType(context.docType),
    [context.docType]
  )

  const target = assistant.target
  const field: FieldDefinition | undefined = target
    ? template.fields[target.fieldId]
    : undefined
  const support = getFieldSupport(field)
  const familyLabel = docTypeLabel(context.docType)

  const currentValue = target
    ? String(documentData[target.fieldId] ?? '')
    : ''
  const hasContent = currentValue.trim().length > 0
  const isGenerating = assistant.status === 'generating'
  const suggestion = assistant.suggestion

  function handleAction(action: TRAssistantAction) {
    if (!target) return
    if (action === 'expand' && currentValue.trim().length < 30) {
      toast.error(
        'Escreva pelo menos 30 caracteres antes de expandir. A simulação precisa de uma base mínima.'
      )
      return
    }
    if (action === 'rewrite' && !hasContent) {
      toast.error('Não há texto para reescrever — use "Sugerir" primeiro.')
      return
    }
    requestAssistantSuggestion(action)
  }

  function handleApply() {
    if (!suggestion) return
    if (hasContent) {
      setConfirmOverwrite(true)
      return
    }
    const ok = applyAssistantSuggestion()
    if (ok) toast.success('Sugestão aplicada ao campo.')
  }

  function confirmAndApply() {
    setConfirmOverwrite(false)
    const ok = applyAssistantSuggestion({ allowOverwrite: true })
    if (ok) toast.success('Texto substituído com a sugestão da IA.')
  }

  async function handleCopy() {
    if (!suggestion) return
    try {
      await navigator.clipboard.writeText(suggestion.content)
      toast.success('Sugestão copiada para a área de transferência.')
    } catch {
      toast.error('Não foi possível copiar o texto.')
    }
  }

  return (
    <>
      <Card className='rounded-2xl border-primary/10 bg-primary/[0.03] dark:border-white/10'>
        <CardHeader className='space-y-3 pb-3'>
          <Badge
            variant='outline'
            className='w-fit gap-1.5 rounded-full border-primary/20 bg-background/80 text-primary'
          >
            <Sparkles aria-hidden='true' className='size-3.5' />
            Assistente mockado
          </Badge>
          <div className='space-y-1'>
            <CardTitle className='text-base'>
              {target && field
                ? `IA para "${field.label}"`
                : 'Assistente da redação'}
            </CardTitle>
            <CardDescription className='text-xs'>
              {target && field ? (
                <>
                  Tipo <span translate='no'>{familyLabel}</span>. As sugestões
                  são determinísticas e ficam restritas a este campo.
                </>
              ) : (
                'Foque um campo de texto na etapa atual para liberar as ações da IA.'
              )}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {!target ? (
            <p className='rounded-xl border border-dashed border-primary/20 bg-background/60 px-3 py-4 text-xs text-muted-foreground'>
              Clique em um campo de texto para selecioná-lo. A IA fica
              indisponível em selects, datas e revisão.
            </p>
          ) : support !== 'narrative' ? (
            <Alert>
              <AlertTitle className='text-sm'>Sem geração para este campo</AlertTitle>
              <AlertDescription className='text-xs'>
                A IA atua apenas em campos narrativos (textareas). Use as
                opções diretas do campo para preencher.
              </AlertDescription>
            </Alert>
          ) : (
            <div className='grid grid-cols-3 gap-2'>
              {actionOrder.map((action) => {
                const Icon = actionIcons[action]
                return (
                  <Button
                    key={action}
                    type='button'
                    size='sm'
                    variant={
                      suggestion?.action === action ? 'default' : 'outline'
                    }
                    className='h-auto flex-col gap-1 rounded-xl py-2 text-xs'
                    onClick={() => handleAction(action)}
                    disabled={isGenerating}
                    title={trAssistantActionDescriptions[action]}
                  >
                    <Icon aria-hidden='true' className='size-3.5' />
                    {trAssistantActionLabels[action]}
                  </Button>
                )
              })}
            </div>
          )}

          {assistant.error ? (
            <Alert variant='destructive'>
              <AlertTitle className='text-sm'>Atenção</AlertTitle>
              <AlertDescription className='text-xs'>
                {assistant.error}
              </AlertDescription>
            </Alert>
          ) : null}

          {isGenerating ? (
            <div
              aria-busy='true'
              aria-label='Gerando sugestão'
              className='space-y-2 rounded-xl border border-dashed bg-background/60 p-3'
            >
              <Skeleton className='h-3 w-32' />
              <Skeleton className='h-3 w-full' />
              <Skeleton className='h-3 w-11/12' />
              <Skeleton className='h-3 w-9/12' />
            </div>
          ) : null}

          {!isGenerating && suggestion ? (
            <div className='space-y-3 rounded-xl border-0 bg-background p-3 shadow-border'>
              <div className='flex items-start justify-between gap-2'>
                <div className='space-y-1'>
                  <div className='text-xs font-semibold tracking-[0.14em] text-primary uppercase'>
                    {trAssistantActionLabels[suggestion.action]}
                  </div>
                  <div className='text-sm font-semibold'>{suggestion.title}</div>
                </div>
                <Button
                  type='button'
                  size='sm'
                  variant='ghost'
                  className='relative shrink-0 rounded-lg after:absolute after:inset-[-4px] after:content-[""]'
                  onClick={handleCopy}
                  aria-label='Copiar sugestão'
                >
                  <Copy aria-hidden='true' className='size-3.5' />
                </Button>
              </div>
              <ScrollArea className='max-h-48 rounded-md border bg-muted/30 p-3 text-xs leading-relaxed'>
                <p className='whitespace-pre-line text-pretty'>
                  {suggestion.content}
                </p>
              </ScrollArea>
              {suggestion.note ? (
                <p className='text-xs text-muted-foreground'>
                  ℹ {suggestion.note}
                </p>
              ) : null}
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  size='sm'
                  className='rounded-xl'
                  onClick={handleApply}
                >
                  Aplicar no campo
                </Button>
                <Button
                  type='button'
                  size='sm'
                  variant='ghost'
                  className='rounded-xl'
                  onClick={() => discardAssistantSuggestion()}
                >
                  <RotateCcw aria-hidden='true' className='size-3.5' />
                  Descartar
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmOverwrite}
        onOpenChange={setConfirmOverwrite}
      >
        <AlertDialogContent className='rounded-2xl'>
          <AlertDialogHeader>
            <AlertDialogTitle>Substituir o texto atual?</AlertDialogTitle>
            <AlertDialogDescription>
              O campo já tem conteúdo. Aplicar a sugestão vai sobrescrever o
              texto existente — essa ação não pode ser desfeita
              automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='rounded-xl'>
              Manter o que está
            </AlertDialogCancel>
            <AlertDialogAction
              className='rounded-xl'
              onClick={confirmAndApply}
            >
              Sim, substituir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
