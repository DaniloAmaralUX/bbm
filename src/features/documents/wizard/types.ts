import { type DocType } from '@/features/documents/data/doc-type'
import {
  type DocumentData,
  type ModelDefinition,
  type ReviewState,
  buildReviewState,
  createDocumentData,
  getModelForDocType,
} from '@/features/documents/data/templates'

export type TRWizardSubmissionStatus = 'editing' | 'submitting' | 'completed'

export type TRWizardContext = {
  docType: DocType
  title: string
  responsibleUnit: string
  referenceCode: string
}

export type TRWizardData = {
  currentStep: number
  submission: {
    status: TRWizardSubmissionStatus
    savedAt: string
    completedAt: string
  }
  context: TRWizardContext
  documentData: DocumentData
  reviewState: ReviewState
  isDirty: boolean
}

export function getCurrentTemplate(context: TRWizardContext): ModelDefinition {
  return getModelForDocType(context.docType)
}

export function createInitialTRWizardData(): TRWizardData {
  const docType: DocType = 'dfd'
  const model = getModelForDocType(docType)

  const context: TRWizardContext = {
    docType,
    title: 'Aquisição de mobiliário para as unidades de atendimento',
    responsibleUnit: 'Secretaria de Administração',
    referenceCode: 'DFD-2026-021',
  }

  const documentData = createDocumentData(model, {
    requestingUnit: 'Secretaria de Administração',
    responsible: 'Ana Ribeiro',
    object:
      'Aquisição de mobiliário corporativo para reequipar as unidades de atendimento ao público, com entrega e montagem inclusas.',
    justification:
      'O mobiliário atual está depreciado e compromete a ergonomia e o atendimento. A renovação melhora as condições de trabalho e a experiência do cidadão.',
    expectedDate: '30/06/2026',
    pcaLink: 'Item 12/2026 do Plano de Contratações Anual',
  })

  return {
    currentStep: 0,
    submission: {
      status: 'editing',
      savedAt: '',
      completedAt: '',
    },
    context,
    documentData,
    reviewState: buildReviewState(context, model, documentData),
    isDirty: false,
  }
}
