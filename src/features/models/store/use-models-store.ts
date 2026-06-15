import { create } from 'zustand'
import { type DocType } from '@/features/documents/data/doc-type'
import {
  type ModelDefinition,
  standardModelByType,
  standardModels,
} from '@/features/documents/data/templates'

/**
 * Store dos modelos da fase preparatória (Fase 2 - construtor de modelos).
 * Frontend-first: os modelos vivem em memória, semeados com os 3 modelos
 * padrão publicados. A Sustentação pode criar/editar/publicar outros por tipo
 * (CRUD chega nos PRs seguintes da Fase 2).
 */
type ModelsState = {
  models: ModelDefinition[]
}

export const useModelsStore = create<ModelsState>()(() => ({
  models: standardModels,
}))

// --- Seletores puros (funcionam fora do React via getState) ---

export function getAllModels(): ModelDefinition[] {
  return useModelsStore.getState().models
}

export function getModelById(id: string): ModelDefinition | undefined {
  return useModelsStore.getState().models.find((model) => model.id === id)
}

export function getModelsByDocType(docType: DocType): ModelDefinition[] {
  return useModelsStore
    .getState()
    .models.filter((model) => model.docType === docType)
}

/**
 * Modelo publicado padrão (o primeiro) de um tipo de documento. Usado pela
 * cadeia/wizard da Fase 1. Cai no modelo padrão semeado se nada estiver
 * publicado (garante retorno sempre definido).
 */
export function getModelForDocType(docType: DocType): ModelDefinition {
  const models = useModelsStore.getState().models
  const published = models.find(
    (model) => model.docType === docType && model.state === 'published'
  )
  if (published) return published
  const anyOfType = models.find((model) => model.docType === docType)
  return anyOfType ?? standardModelByType[docType]
}
