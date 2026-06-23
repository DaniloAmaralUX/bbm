import { create } from 'zustand'
import {
  type DocType,
  docTypeFullLabel,
  docTypeLabel,
} from '@/features/documents/data/doc-type'
import {
  type FieldDefinition,
  type ModelDefinition,
  type SectionDefinition,
  standardModelByType,
  standardModels,
} from '@/features/documents/data/templates'

/**
 * Store dos modelos da fase preparatória (Fase 2 - construtor de modelos).
 * Frontend-first: os modelos vivem em memória, semeados com os 3 modelos
 * padrão publicados. A Sustentação cria/edita os modelos aqui; publicar e
 * versionar chegam num PR seguinte da Fase 2.
 */
type ModelsState = {
  models: ModelDefinition[]
  /** Cria um modelo rascunho vazio do tipo informado. Retorna o id novo. */
  createDraftModel: (docType: DocType) => string
  updateModelMeta: (
    id: string,
    patch: { name?: string; intro?: string }
  ) => void
  deleteModel: (id: string) => void
  addSection: (modelId: string) => void
  updateSection: (
    modelId: string,
    sectionId: string,
    patch: Partial<Pick<SectionDefinition, 'title' | 'description'>>
  ) => void
  removeSection: (modelId: string, sectionId: string) => void
  addField: (modelId: string, sectionId: string) => void
  updateField: (
    modelId: string,
    fieldId: string,
    patch: Partial<FieldDefinition>
  ) => void
  removeField: (modelId: string, sectionId: string, fieldId: string) => void
  /** Publica o modelo; republicar um ja publicado incrementa a versao. */
  publishModel: (id: string) => void
  /** Volta o modelo para rascunho (a cadeia deixa de usa-lo). */
  unpublishModel: (id: string) => void
  /**
   * Importa para o modelo os campos herdaveis do modelo publicado do tipo pai,
   * preservando o id (a heranca casa por id de campo). Retorna quantos campos
   * foram importados (0 se nenhum novo).
   */
  importInheritableFields: (modelId: string, parentDocType: DocType) => number
}

function newId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${rand}`
}

function nowStamp(): string {
  return new Date().toISOString()
}

/** Aplica `fn` ao modelo de id `id` e carimba `updatedAt`; demais inalterados. */
function patchModel(
  models: ModelDefinition[],
  id: string,
  fn: (model: ModelDefinition) => ModelDefinition
): ModelDefinition[] {
  return models.map((model) =>
    model.id === id ? { ...fn(model), updatedAt: nowStamp() } : model
  )
}

export const useModelsStore = create<ModelsState>()((set, get) => ({
  models: standardModels,

  createDraftModel: (docType) => {
    const id = newId('model')
    const model: ModelDefinition = {
      id,
      docType,
      name: `Novo modelo de ${docType.toUpperCase()}`,
      label: docTypeFullLabel(docType),
      intro: '',
      state: 'draft',
      version: 1,
      updatedAt: nowStamp(),
      fields: {},
      sections: [],
    }
    set((state) => ({ models: [model, ...state.models] }))
    return id
  },

  updateModelMeta: (id, patch) =>
    set((state) => ({
      models: patchModel(state.models, id, (model) => ({ ...model, ...patch })),
    })),

  deleteModel: (id) =>
    set((state) => ({
      models: state.models.filter((model) => model.id !== id),
    })),

  addSection: (modelId) =>
    set((state) => ({
      models: patchModel(state.models, modelId, (model) => ({
        ...model,
        sections: [
          ...model.sections,
          {
            id: newId('section'),
            title: `Seção ${model.sections.length + 1}`,
            description: '',
            kind: 'fields',
            fieldIds: [],
          },
        ],
      })),
    })),

  updateSection: (modelId, sectionId, patch) =>
    set((state) => ({
      models: patchModel(state.models, modelId, (model) => ({
        ...model,
        sections: model.sections.map((section) =>
          section.id === sectionId ? { ...section, ...patch } : section
        ),
      })),
    })),

  removeSection: (modelId, sectionId) =>
    set((state) => ({
      models: patchModel(state.models, modelId, (model) => {
        const section = model.sections.find((item) => item.id === sectionId)
        const removedFieldIds = new Set(section?.fieldIds ?? [])
        const fields = { ...model.fields }
        for (const fieldId of removedFieldIds) delete fields[fieldId]
        return {
          ...model,
          fields,
          sections: model.sections.filter((item) => item.id !== sectionId),
        }
      }),
    })),

  addField: (modelId, sectionId) =>
    set((state) => ({
      models: patchModel(state.models, modelId, (model) => {
        const fieldId = newId('field')
        const field: FieldDefinition = {
          id: fieldId,
          label: 'Novo campo',
          input: 'text',
          required: false,
        }
        return {
          ...model,
          fields: { ...model.fields, [fieldId]: field },
          sections: model.sections.map((section) =>
            section.id === sectionId
              ? { ...section, fieldIds: [...(section.fieldIds ?? []), fieldId] }
              : section
          ),
        }
      }),
    })),

  updateField: (modelId, fieldId, patch) =>
    set((state) => ({
      models: patchModel(state.models, modelId, (model) => {
        const current = model.fields[fieldId]
        if (!current) return model
        return {
          ...model,
          fields: {
            ...model.fields,
            [fieldId]: { ...current, ...patch, id: fieldId },
          },
        }
      }),
    })),

  removeField: (modelId, sectionId, fieldId) =>
    set((state) => ({
      models: patchModel(state.models, modelId, (model) => {
        const fields = { ...model.fields }
        delete fields[fieldId]
        return {
          ...model,
          fields,
          sections: model.sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  fieldIds: (section.fieldIds ?? []).filter(
                    (id) => id !== fieldId
                  ),
                }
              : section
          ),
        }
      }),
    })),

  publishModel: (id) =>
    set((state) => ({
      models: patchModel(state.models, id, (model) => ({
        ...model,
        state: 'published',
        version:
          model.state === 'published' ? model.version + 1 : model.version,
      })),
    })),

  unpublishModel: (id) =>
    set((state) => ({
      models: patchModel(state.models, id, (model) => ({
        ...model,
        state: 'draft',
      })),
    })),

  importInheritableFields: (modelId, parentDocType) => {
    const model = get().models.find((item) => item.id === modelId)
    if (!model) return 0
    const parent = getModelForDocType(parentDocType)
    const existingIds = new Set(Object.keys(model.fields))
    const toAdd = Object.values(parent.fields).filter(
      (field) => field.inheritable && !existingIds.has(field.id)
    )
    if (toAdd.length === 0) return 0
    set((state) => ({
      models: patchModel(state.models, modelId, (current) => {
        const fields = { ...current.fields }
        for (const field of toAdd) {
          fields[field.id] = { ...field, inheritable: true }
        }
        const sectionTitle = `Herdados de ${docTypeLabel(parentDocType)}`
        const target = current.sections.find(
          (section) =>
            section.kind === 'fields' && section.title === sectionTitle
        )
        const sections: SectionDefinition[] = target
          ? current.sections.map((section) =>
              section.id === target.id
                ? {
                    ...section,
                    fieldIds: [
                      ...(section.fieldIds ?? []),
                      ...toAdd.map((field) => field.id),
                    ],
                  }
                : section
            )
          : [
              {
                id: newId('section'),
                title: sectionTitle,
                description:
                  'Campos que fluem do documento anterior por herança.',
                kind: 'fields',
                fieldIds: toAdd.map((field) => field.id),
              },
              ...current.sections,
            ]
        return { ...current, fields, sections }
      }),
    }))
    return toAdd.length
  },
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
 * Modelo vazio sintetico para um tipo sem nenhum modelo cadastrado nem semente
 * padrao. Garante o invariante de `getModelForDocType` ("sempre definido") agora
 * que DocType=string nao limita mais `standardModelByType` aos tipos-semente.
 */
function emptyModelFor(docType: DocType): ModelDefinition {
  return {
    id: `model-${docType}-vazio`,
    docType,
    name: docTypeFullLabel(docType),
    label: docTypeFullLabel(docType),
    intro: '',
    state: 'draft',
    version: 1,
    updatedAt: nowStamp(),
    fields: {},
    sections: [],
  }
}

/**
 * Modelo publicado padrão (o primeiro) de um tipo de documento. Usado pela
 * cadeia/wizard da Fase 1. Cai no modelo padrão semeado e, por fim, num modelo
 * vazio sintetico se nada existir (garante retorno sempre definido).
 */
export function getModelForDocType(docType: DocType): ModelDefinition {
  const models = useModelsStore.getState().models
  const published = models.find(
    (model) => model.docType === docType && model.state === 'published'
  )
  if (published) return published
  const anyOfType = models.find((model) => model.docType === docType)
  const seeded: ModelDefinition | undefined = standardModelByType[docType]
  return anyOfType ?? seeded ?? emptyModelFor(docType)
}
