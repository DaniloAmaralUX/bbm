import { create } from 'zustand'
import {
  type TRDeliveryLocation,
  type DocumentData,
  type TRInstitution,
  type TRLot,
  type TRLotItem,
  type TRTemplateType,
  buildReviewState,
  createDocumentData,
  createEmptyDeliveryLocation,
  createEmptyLot,
  createEmptyLotItem,
  getDefaultTemplateForInstitution,
  getTemplateDefinition,
  hasMeaningfulData,
} from '@/features/tr/data/templates'
import {
  type TRAssistantAction,
  type TRAssistantState,
  type TRAssistantTarget,
  createInitialAssistantState,
  generateAssistantSuggestion,
} from '@/features/tr/data/tr-assistant'
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
  updateContext: (
    values: Partial<Omit<TRWizardContext, 'institution' | 'templateType'>>
  ) => void
  changeTemplate: (
    institution: TRInstitution,
    templateType?: TRTemplateType
  ) => void
  setFieldValue: (fieldId: string, value: string) => void
  setAssistantTarget: (target: TRAssistantTarget | null) => void
  requestAssistantSuggestion: (action: TRAssistantAction) => void
  applyAssistantSuggestion: (options?: { allowOverwrite?: boolean }) => boolean
  discardAssistantSuggestion: () => void
  addLot: () => void
  removeLot: (lotId: string) => void
  updateLot: (
    lotId: string,
    values: Partial<Omit<TRLot, 'items' | 'id'>>
  ) => void
  addLotItem: (lotId: string) => void
  updateLotItem: (
    lotId: string,
    itemId: string,
    values: Partial<Omit<TRLotItem, 'id'>>
  ) => void
  removeLotItem: (lotId: string, itemId: string) => void
  addDeliveryLocation: () => void
  updateDeliveryLocation: (
    deliveryId: string,
    values: Partial<Omit<TRDeliveryLocation, 'id'>>
  ) => void
  removeDeliveryLocation: (deliveryId: string) => void
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
  const template = getTemplateDefinition(
    context.institution,
    context.templateType
  )
  return {
    ...partial,
    context,
    documentData,
    reviewState: buildReviewState(context, template, documentData),
  }
}

function clampStep(step: number, context: TRWizardContext) {
  const template = getTemplateDefinition(
    context.institution,
    context.templateType
  )
  return Math.max(0, Math.min(step, template.sections.length))
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
  changeTemplate: (institution, templateType) =>
    set((state) => {
      const nextTemplateType =
        templateType ?? getDefaultTemplateForInstitution(institution)
      const context = {
        ...state.context,
        institution,
        templateType: nextTemplateType,
      }
      const template = getTemplateDefinition(institution, nextTemplateType)
      const documentData = createDocumentData(template, state.documentData)
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
    const template = getTemplateDefinition(
      state.context.institution,
      state.context.templateType
    )
    const sectionForTarget = template.sections.find(
      (section) => section.id === target.sectionId
    )
    const currentSection =
      sectionForTarget ?? template.sections[state.currentStep - 1]
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
        template,
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
  addLot: () =>
    set((state) => {
      const lots = (
        (state.documentData.lots as TRLot[] | undefined) ?? []
      ).concat(createEmptyLot())
      const documentData = { ...state.documentData, lots }
      return {
        ...syncState(state.context, documentData),
        isDirty: true,
      }
    }),
  removeLot: (lotId) =>
    set((state) => {
      const currentLots = (state.documentData.lots as TRLot[] | undefined) ?? []
      const nextLots = currentLots.filter((lot) => lot.id !== lotId)
      const documentData = {
        ...state.documentData,
        lots: nextLots.length ? nextLots : [createEmptyLot()],
      }
      return {
        ...syncState(state.context, documentData),
        isDirty: true,
      }
    }),
  updateLot: (lotId, values) =>
    set((state) => {
      const lots = ((state.documentData.lots as TRLot[] | undefined) ?? []).map(
        (lot) => (lot.id === lotId ? { ...lot, ...values } : lot)
      )
      const documentData = { ...state.documentData, lots }
      return {
        ...syncState(state.context, documentData),
        isDirty: true,
      }
    }),
  addLotItem: (lotId) =>
    set((state) => {
      const lots = ((state.documentData.lots as TRLot[] | undefined) ?? []).map(
        (lot) =>
          lot.id === lotId
            ? { ...lot, items: lot.items.concat(createEmptyLotItem()) }
            : lot
      )
      const documentData = { ...state.documentData, lots }
      return {
        ...syncState(state.context, documentData),
        isDirty: true,
      }
    }),
  updateLotItem: (lotId, itemId, values) =>
    set((state) => {
      const lots = ((state.documentData.lots as TRLot[] | undefined) ?? []).map(
        (lot) =>
          lot.id === lotId
            ? {
                ...lot,
                items: lot.items.map((item) =>
                  item.id === itemId ? { ...item, ...values } : item
                ),
              }
            : lot
      )
      const documentData = { ...state.documentData, lots }
      return {
        ...syncState(state.context, documentData),
        isDirty: true,
      }
    }),
  removeLotItem: (lotId, itemId) =>
    set((state) => {
      const lots = ((state.documentData.lots as TRLot[] | undefined) ?? []).map(
        (lot) => {
          if (lot.id !== lotId) return lot
          const nextItems = lot.items.filter((item) => item.id !== itemId)
          return {
            ...lot,
            items: nextItems.length ? nextItems : [createEmptyLotItem()],
          }
        }
      )
      const documentData = { ...state.documentData, lots }
      return {
        ...syncState(state.context, documentData),
        isDirty: true,
      }
    }),
  addDeliveryLocation: () =>
    set((state) => {
      const deliveries = (
        (state.documentData.deliveries as TRDeliveryLocation[] | undefined) ??
        []
      ).concat(createEmptyDeliveryLocation())
      const documentData = { ...state.documentData, deliveries }
      return {
        ...syncState(state.context, documentData),
        isDirty: true,
      }
    }),
  updateDeliveryLocation: (deliveryId, values) =>
    set((state) => {
      const deliveries = (
        (state.documentData.deliveries as TRDeliveryLocation[] | undefined) ??
        []
      ).map((entry) =>
        entry.id === deliveryId ? { ...entry, ...values } : entry
      )
      const documentData = { ...state.documentData, deliveries }
      return {
        ...syncState(state.context, documentData),
        isDirty: true,
      }
    }),
  removeDeliveryLocation: (deliveryId) =>
    set((state) => {
      const currentDeliveries =
        (state.documentData.deliveries as TRDeliveryLocation[] | undefined) ??
        []
      const nextDeliveries = currentDeliveries.filter(
        (entry) => entry.id !== deliveryId
      )
      const documentData = {
        ...state.documentData,
        deliveries: nextDeliveries.length
          ? nextDeliveries
          : [createEmptyDeliveryLocation()],
      }
      return {
        ...syncState(state.context, documentData),
        isDirty: true,
      }
    }),
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
      // Protótipo: as TRs da lista são registros-resumo (não guardam o
      // documentData completo). Carregamos os metadados disponíveis (título
      // como "Cópia de…", unidade) e mantemos o documentData/template atual
      // como base editável populada. Cópia campo-a-campo fiel exige backend.
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
