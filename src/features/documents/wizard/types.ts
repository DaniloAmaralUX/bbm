import { type DocType } from '@/features/documents/data/doc-type'
import {
  type ChainState,
  createChainState,
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

/** Envelope comum (submission/isDirty) em volta de uma cadeia + contexto. */
function wizardDataFrom(
  chain: ChainState,
  context: TRWizardContext
): TRWizardData {
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

/**
 * Estado inicial do wizard: a cadeia DFD->ETP->TR semeada com os dados demo da
 * prefeitura (o fluxo padrao de "Novo documento").
 */
export function createInitialTRWizardData(): TRWizardData {
  const chain = createInitialChainState()
  return wizardDataFrom(chain, {
    docType: chain.current,
    title: 'Aquisição de mobiliário para as unidades de atendimento',
    responsibleUnit: 'Secretaria de Administração',
    referenceCode: 'DFD-2026-021',
  })
}

/**
 * Estado do wizard para iniciar um documento de um TIPO especifico (avulso ou a
 * raiz de uma cadeia), sem dados demo. A cadeia vem de `createChainState`, que
 * resolve a sequencia a partir do tipo (`chainTypesOf`): tipo avulso => doc
 * unico; raiz de cadeia => cadeia inteira.
 */
export function createWizardDataForType(tipo: DocType): TRWizardData {
  const chain = createChainState({ current: tipo })
  return wizardDataFrom(chain, {
    docType: chain.current,
    title: '',
    responsibleUnit: '',
    referenceCode: '',
  })
}
