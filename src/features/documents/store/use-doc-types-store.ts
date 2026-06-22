import { create } from 'zustand'
import {
  type DocumentType,
  seedDocumentTypes,
} from '@/features/documents/data/doc-types-registry'

/**
 * Store do registry de tipos de documento (F2). Frontend-first: os tipos vivem
 * em memoria, semeados com DFD/ETP/TR. Espelha o padrao de `use-models-store`:
 * store Zustand sem persist + seletores puros que funcionam fora do React via
 * `getState()` (mesmo padrao que `inheritance.ts` usa com `getModelForDocType`).
 *
 * Nesta fundacao o registry e somente-leitura — as mutacoes (criar/renomear/
 * excluir tipo) chegam com a UI de Sustentacao numa fase seguinte. Por isso o
 * hook reativo ainda nao e exportado; os consumidores leem pelos seletores.
 */
type DocTypesState = {
  types: DocumentType[]
}

const useDocTypesStore = create<DocTypesState>()(() => ({
  types: seedDocumentTypes,
}))

// --- Seletores puros (funcionam fora do React via getState) ---

/** Todos os tipos registrados, ordenados por `order` (copia estavel). */
export function getAllDocTypes(): DocumentType[] {
  return [...useDocTypesStore.getState().types].sort(
    (a, b) => a.order - b.order
  )
}

/** Tipo pelo id, ou `undefined` se nao existir (id orfao/desconhecido). */
export function getDocTypeById(id: string): DocumentType | undefined {
  return useDocTypesStore.getState().types.find((type) => type.id === id)
}
