import { ArrowRight, Check, Lock } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import {
  type DocType,
  chainTypesOf,
  docTypeFullLabel,
  docTypeLabel,
} from '@/features/documents/data/doc-type'

type ChainStepperProps = {
  current: DocType
  done: Record<DocType, boolean>
  locked: Record<DocType, boolean>
  onSelect: (docType: DocType) => void
}

type StepState = 'done' | 'current' | 'locked' | 'idle'

function stepStateFor(
  docType: DocType,
  current: DocType,
  done: Record<DocType, boolean>,
  locked: Record<DocType, boolean>
): StepState {
  if (done[docType]) return 'done'
  if (docType === current) return 'current'
  if (locked[docType]) return 'locked'
  return 'idle'
}

/**
 * Stepper da cadeia documental DFD -> ETP -> TR. Cada passo navega para o seu
 * documento (quando nao bloqueado). Estados: concluido (check, acento primary),
 * atual (aria-current), bloqueado (cadeado, desabilitado). Vira coluna no mobile.
 */
export function TRStepper({
  current,
  done,
  locked,
  onSelect,
}: ChainStepperProps) {
  const chainTypes = chainTypesOf(current)
  return (
    <nav
      aria-label='Cadeia documental'
      className='flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch'
    >
      {chainTypes.map((docType, index) => {
        const state = stepStateFor(docType, current, done, locked)
        const isLast = index === chainTypes.length - 1
        return (
          <div
            key={docType}
            className='flex flex-1 flex-col items-stretch gap-2 sm:flex-row sm:items-center'
          >
            <ChainStep
              docType={docType}
              index={index}
              state={state}
              onSelect={onSelect}
            />
            {!isLast ? (
              <ArrowRight
                aria-hidden='true'
                className='mx-auto size-4 shrink-0 rotate-90 text-muted-foreground sm:mx-0 sm:rotate-0'
              />
            ) : null}
          </div>
        )
      })}
    </nav>
  )
}

function ChainStep({
  docType,
  index,
  state,
  onSelect,
}: {
  docType: DocType
  index: number
  state: StepState
  onSelect: (docType: DocType) => void
}) {
  const isDone = state === 'done'
  const isCurrent = state === 'current'
  const isLocked = state === 'locked'

  return (
    <button
      type='button'
      onClick={() => onSelect(docType)}
      disabled={isLocked}
      aria-current={isCurrent ? 'step' : undefined}
      className={cn(
        'group flex min-h-11 w-full flex-1 items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-left transition-[background-color,border-color,box-shadow] duration-200 ease-[var(--ease-emil-out)] motion-reduce:transition-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
        isCurrent && 'border-primary shadow-[0_0_0_1px_var(--primary)]',
        isDone && 'border-primary/40',
        !isCurrent &&
          !isDone &&
          !isLocked &&
          'border-border hover:border-primary/40',
        isLocked && 'cursor-not-allowed border-border opacity-60'
      )}
    >
      <span
        aria-hidden='true'
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold',
          isDone && 'bg-primary text-primary-foreground',
          isCurrent && 'bg-secondary text-secondary-foreground',
          !isDone && !isCurrent && 'bg-muted text-muted-foreground'
        )}
      >
        {isDone ? (
          <Check className='size-4' />
        ) : isLocked ? (
          <Lock className='size-3.5' />
        ) : (
          index + 1
        )}
      </span>
      <span className='min-w-0'>
        <span
          translate='no'
          className='block text-sm font-semibold tracking-tight'
        >
          {docTypeLabel(docType)}
        </span>
        <span className='block truncate text-xs text-muted-foreground'>
          {docTypeFullLabel(docType)}
        </span>
      </span>
      <span className='sr-only'>
        {isDone
          ? '. Concluído.'
          : isCurrent
            ? '. Documento atual.'
            : isLocked
              ? '. Bloqueado: conclua o documento anterior.'
              : ''}
      </span>
    </button>
  )
}
