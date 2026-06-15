import { create } from 'zustand'
import { type DocType } from '@/features/documents/data/doc-type'
import {
  type DocumentData,
  buildReviewState,
  createDocumentData,
  getModelForDocType,
  hasMeaningfulData,
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
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  updateContext: (values: Partial<Omit<TRWizardContext, 'docType'>>) => void
  changeDocType: (docType: DocType) => void
  setFieldValue: (fieldId: string, value: string) => void
  setAssistantTarget: (target: TRAssistantTarget | null) => void
  requestAssistantSuggestion: (action: TRAssistantAction) => void
  applyAssistantSuggestion: (options?: { allowOverwrite?: boolean }) => boolean
  discardAssistantSuggestion: () => void
  saveDraft: () => void
  startSubmission: () => void
  completeSubmission: () => void
  seedFromDuplicate: (source: {
    id: string
    title: string
    unit: string
  }) => void
  reset: () => void
  hasCustomData: () => boolean
}

function syncState(
  context: TRWizardContext,
  documentData: DocumentData,
  partial?: Partial<TRWizardData>
) {
  const model = getModelForDocType(context.docType)
  return {
    ...partial,
    context,
    documentData,
    reviewState: buildReviewState(context, model, documentData),
  }
}

function clampStep(step: number, context: TRWizardContext) {
  const model = getModelForDocType(context.docType)
  return Math.max(0, Math.min(step, model.sections.length))
}

export const useTRWizard = create<TRWizardState>()((set, get) => ({
  ...createInitialTRWizardData(),
  assistant: createInitialAssistantState(),
  nextStep: () =>
    set((state) => ({
      currentStep: clampStep(state.currentStep + 1, state.context),
    })),
  prevStep: () =>
    set((state) => ({
      currentStep: clampStep(state.currentStep - 1, state.context),
    })),
  goToStep: (step) =>
    set((state) => ({
      currentStep: clampStep(step, state.context),
    })),
  updateContext: (values) =>
    set((state) => {
      const context = { ...state.context, ...values }
      return {
        ...syncState(context, state.documentData),
        isDirty: true,
      }
    }),
  changeDocType: (docType) =>
    set((state) => {
      const context = { ...state.context, docType }
      const model = getModelForDocType(docType)
      const documentData = createDocumentData(model, state.documentData)
      return {
        ...syncState(context, documentData),
        currentStep: clampStep(0, context),
        isDirty: true,
      }
    }),
  setFieldValue: (fieldId, value) =>
    set((state) => {
      const documentData = { ...state.documentData, [fieldId]: value }
      return {
        ...syncState(state.context, documentData),
        isDirty: true,
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
    const model = getModelForDocType(state.context.docType)
    const sectionForTarget = model.sections.find(
      (section) => section.id === target.sectionId
    )
    const currentSection =
      sectionForTarget ?? model.sections[state.currentStep - 1]
    if (!currentSection || currentSection.kind !== 'fields') {
      set({
        assistant: {
          ...state.assistant,
          status: 'error',
          error: 'A assistência está disponível apenas em etapas de texto.',
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
        documentData: next.documentData,
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
    const currentValue = String(state.documentData[suggestion.fieldId] ?? '')
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
    const documentData = {
      ...state.documentData,
      [suggestion.fieldId]: suggestion.content,
    }
    set({
      ...syncState(state.context, documentData),
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
  startSubmission: () =>
    set((state) => ({
      submission: {
        ...state.submission,
        status: 'submitting',
        completedAt: '',
      },
    })),
  completeSubmission: () =>
    set((state) => ({
      submission: {
        ...state.submission,
        status: 'completed',
        completedAt: new Intl.DateTimeFormat('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(new Date()),
      },
      isDirty: false,
    })),
  seedFromDuplicate: (source) =>
    set((state) => {
      // Protótipo: os documentos da lista são registros-resumo (não guardam o
      // documentData completo). Carregamos os metadados disponíveis (título
      // como "Cópia de…", unidade) e mantemos o documentData/modelo atual
      // como base editável. Cópia campo-a-campo fiel exige backend.
      const context = {
        ...state.context,
        title: `Cópia de ${source.title}`,
        responsibleUnit: source.unit,
      }
      return {
        ...syncState(context, state.documentData),
        currentStep: 0,
        submission: {
          status: 'editing' as const,
          savedAt: '',
          completedAt: '',
        },
        isDirty: false,
      }
    }),
  reset: () =>
    set({
      ...createInitialTRWizardData(),
      assistant: createInitialAssistantState(),
    }),
  hasCustomData: () => {
    const state = get()
    return (
      state.isDirty ||
      hasMeaningfulData(state.documentData) ||
      state.context.title.trim() !== '' ||
      state.context.responsibleUnit.trim() !== '' ||
      state.context.referenceCode.trim() !== ''
    )
  },
}))
