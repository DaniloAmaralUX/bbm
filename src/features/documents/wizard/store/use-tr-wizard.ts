import { create } from 'zustand'
import { type DocType } from '@/features/documents/data/doc-type'
import {
  type ChainState,
  type DocumentCells,
  cellsToDocumentData,
  concludeDocument,
  inheritCommonFields,
  isDocumentLocked,
  revertCellToInherited,
  setCellValue,
} from '@/features/documents/data/inheritance'
import {
  type DocumentData,
  buildReviewState,
  getModelForDocType,
} from '@/features/documents/data/templates'
import {
  type TRAssistantAction,
  type TRAssistantState,
  type TRAssistantTarget,
  createInitialAssistantState,
  generateAssistantSuggestion,
} from '@/features/documents/data/tr-assistant'
import {
  createInitialTRWizardData,
  type TRWizardContext,
  type TRWizardData,
} from '../types'

type TRWizardState = TRWizardData & {
  assistant: TRAssistantState
  /** Cadeia atual (atalho para `chain.current`). */
  goToDoc: (docType: DocType) => void
  updateContext: (values: Partial<Omit<TRWizardContext, 'docType'>>) => void
  setFieldValue: (fieldId: string, value: string) => void
  revertField: (fieldId: string) => void
  concludeCurrent: () => void
  setAssistantTarget: (target: TRAssistantTarget | null) => void
  requestAssistantSuggestion: (action: TRAssistantAction) => void
  applyAssistantSuggestion: (options?: { allowOverwrite?: boolean }) => boolean
  discardAssistantSuggestion: () => void
  saveDraft: () => void
  seedFromDuplicate: (source: {
    id: string
    title: string
    unit: string
  }) => void
  reset: () => void
  /** Celulas do documento corrente. */
  currentCells: () => DocumentCells
  /** `DocumentData` plano do documento corrente (para IA e validacao). */
  currentDocumentData: () => DocumentData
}

/** Deriva o contexto com `docType` sincronizado ao documento corrente da cadeia. */
function contextForChain(
  context: TRWizardContext,
  chain: ChainState
): TRWizardContext {
  if (context.docType === chain.current) return context
  return { ...context, docType: chain.current }
}

export const useTRWizard = create<TRWizardState>()((set, get) => ({
  ...createInitialTRWizardData(),
  assistant: createInitialAssistantState(),
  goToDoc: (docType) =>
    set((state) => {
      if (isDocumentLocked(state.chain, docType)) return {}
      // Sincroniza a heranca ao entrar (campos comuns refletem ancestrais).
      const chain = inheritCommonFields(
        { ...state.chain, current: docType },
        docType
      )
      return { chain, context: contextForChain(state.context, chain) }
    }),
  updateContext: (values) =>
    set((state) => ({
      context: { ...state.context, ...values, docType: state.chain.current },
      isDirty: true,
    })),
  setFieldValue: (fieldId, value) =>
    set((state) => {
      const current = state.chain.current
      if (state.chain.done[current]) return {}
      const chain = setCellValue(state.chain, current, fieldId, value)
      return { chain, isDirty: true }
    }),
  revertField: (fieldId) =>
    set((state) => {
      const current = state.chain.current
      if (state.chain.done[current]) return {}
      const chain = revertCellToInherited(state.chain, current, fieldId)
      return { chain, isDirty: true }
    }),
  concludeCurrent: () =>
    set((state) => {
      const current = state.chain.current
      if (state.chain.done[current]) return {}
      const chain = concludeDocument(state.chain, current)
      return {
        chain,
        submission: {
          ...state.submission,
          status: 'completed' as const,
          completedAt: new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date()),
        },
        isDirty: false,
      }
    }),
  setAssistantTarget: (target) =>
    set((state) => {
      const sameTarget =
        state.assistant.target?.fieldId === target?.fieldId &&
        state.assistant.target?.sectionId === target?.sectionId
      if (sameTarget) return {}
      return {
        assistant: {
          target,
          status: 'idle',
          suggestion: null,
          error: null,
        },
      }
    }),
  requestAssistantSuggestion: (action) => {
    const state = get()
    const target = state.assistant.target
    if (!target) {
      set({
        assistant: {
          ...state.assistant,
          status: 'error',
          error: 'Selecione o campo onde a IA deve atuar.',
        },
      })
      return
    }
    const model = getModelForDocType(state.chain.current)
    const currentSection = model.sections.find(
      (section) => section.id === target.sectionId
    )
    if (!currentSection || currentSection.kind !== 'fields') {
      set({
        assistant: {
          ...state.assistant,
          status: 'error',
          error: 'A assistência está disponível apenas em campos de texto.',
        },
      })
      return
    }

    set({
      assistant: {
        target,
        status: 'generating',
        suggestion: null,
        error: null,
      },
    })

    setTimeout(() => {
      const next = get()
      if (
        next.assistant.target?.fieldId !== target.fieldId ||
        next.assistant.target?.sectionId !== target.sectionId
      ) {
        // target trocou enquanto gerava — descarta resultado
        return
      }
      const suggestion = generateAssistantSuggestion({
        context: next.context,
        template: model,
        currentSection,
        fieldId: target.fieldId,
        documentData: next.currentDocumentData(),
        action,
      })
      if (!suggestion) {
        set({
          assistant: {
            ...next.assistant,
            status: 'error',
            error:
              'Este campo não recebe assistência de IA (é cadastral, data ou seleção).',
          },
        })
        return
      }
      set({
        assistant: {
          target,
          status: 'ready',
          suggestion,
          error: null,
        },
      })
    }, 600)
  },
  applyAssistantSuggestion: ({ allowOverwrite = false } = {}) => {
    const state = get()
    const { suggestion } = state.assistant
    if (!suggestion) return false
    const current = state.chain.current
    if (state.chain.done[current]) return false
    const currentValue = String(
      state.chain.cells[current]?.[suggestion.fieldId]?.value ?? ''
    )
    if (currentValue.trim().length > 0 && !allowOverwrite) {
      set({
        assistant: {
          ...state.assistant,
          status: 'ready',
          error:
            'Este campo já tem conteúdo. Confirme se quer substituir o texto atual.',
        },
      })
      return false
    }
    const chain = setCellValue(
      state.chain,
      current,
      suggestion.fieldId,
      suggestion.content
    )
    set({
      chain,
      isDirty: true,
      assistant: {
        ...state.assistant,
        status: 'idle',
        suggestion: null,
        error: null,
      },
    })
    return true
  },
  discardAssistantSuggestion: () =>
    set((state) => ({
      assistant: {
        ...state.assistant,
        status: 'idle',
        suggestion: null,
        error: null,
      },
    })),
  saveDraft: () =>
    set((state) => ({
      submission: {
        ...state.submission,
        savedAt: new Intl.DateTimeFormat('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(new Date()),
      },
      isDirty: false,
    })),
  seedFromDuplicate: (source) =>
    set((state) => ({
      context: {
        ...state.context,
        title: `Cópia de ${source.title}`,
        responsibleUnit: source.unit,
        docType: state.chain.current,
      },
      submission: {
        status: 'editing' as const,
        savedAt: '',
        completedAt: '',
      },
      isDirty: false,
    })),
  reset: () =>
    set({
      ...createInitialTRWizardData(),
      assistant: createInitialAssistantState(),
    }),
  currentCells: () => {
    const state = get()
    return state.chain.cells[state.chain.current]
  },
  currentDocumentData: () => {
    const state = get()
    return cellsToDocumentData(state.chain.cells[state.chain.current])
  },
}))

/** Estado de revisao do documento corrente, derivado das celulas atuais. */
export function selectReviewState(state: TRWizardState) {
  const model = getModelForDocType(state.chain.current)
  const documentData = cellsToDocumentData(
    state.chain.cells[state.chain.current]
  )
  return buildReviewState(
    {
      title: state.context.title,
      responsibleUnit: state.context.responsibleUnit,
    },
    model,
    documentData
  )
}
