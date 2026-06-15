import { type DocType } from '@/features/documents/data/doc-type'
import {
  type ChainState,
  createInitialChainState,
} from '@/features/documents/data/inheritance'

export type TRWizardSubmissionStatus = 'editing' | 'submitting' | 'completed'

/**
 * Contexto editorial da cadeia (vale para todos os documentos). O `docType`
 * agora e derivado de `chain.current`; aqui ficam so os metadados comuns que
 * acompanham a jornada e aparecem na revisao.
 */
export type TRWizardContext = {
  docType: DocType
  title: string
  responsibleUnit: string
  referenceCode: string
}

export type TRWizardData = {
  /** Estado da cadeia DFD -> ETP -> TR em memoria. */
  chain: ChainState
  submission: {
    status: TRWizardSubmissionStatus
    savedAt: string
    completedAt: string
  }
  context: TRWizardContext
  isDirty: boolean
}

export function createInitialTRWizardData(): TRWizardData {
  const chain = createInitialChainState()

  const context: TRWizardContext = {
    docType: chain.current,
    title: 'Aquisição de mobiliário para as unidades de atendimento',
    responsibleUnit: 'Secretaria de Administração',
    referenceCode: 'DFD-2026-021',
  }

  return {
    chain,
    submission: {
      status: 'editing',
      savedAt: '',
      completedAt: '',
    },
    context,
    isDirty: false,
  }
}
