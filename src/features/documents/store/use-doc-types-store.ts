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
 * Tipos-semente (`seed:true`) sao a cadeia DFD->ETP->TR e sao imutaveis. A
 * Sustentacao cria tipos novos (sempre avulsos: `parentTypeId:null`); a cadeia
 * configuravel para tipos novos fica fora de escopo.
 */
type DocTypesState = {
  types: DocumentType[]
  /** Cria um tipo avulso. Retorna o id novo (slug da sigla, deduplicado). */
  createDocType: (input: { sigla: string; nome: string }) => string
  /** Renomeia sigla/nome de um tipo. No-op em tipos-semente. O id nunca muda. */
  renameDocType: (id: string, patch: { sigla?: string; nome?: string }) => void
  /** Remove um tipo. No-op em tipos-semente. */
  deleteDocType: (id: string) => void
}

/** Slug url-safe a partir de um texto livre: sem acento, minusculo, `[a-z0-9-]`. */
function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Id estavel a partir da sigla: slug deduplicado contra todos os ids existentes
 * (inclui a semente, ex.: sigla "DFD" vira `dfd-2`). Fallback `tipo` se o slug
 * ficar vazio (sigla so com acentos/simbolos), para nunca gerar id vazio.
 */
function uniqueTypeId(sigla: string, existing: DocumentType[]): string {
  const base = slugify(sigla) || 'tipo'
  const taken = new Set(existing.map((type) => type.id))
  if (!taken.has(base)) return base
  let suffix = 2
  while (taken.has(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}

export const useDocTypesStore = create<DocTypesState>()((set, get) => ({
  types: seedDocumentTypes,

  createDocType: ({ sigla, nome }) => {
    const existing = get().types
    const id = uniqueTypeId(sigla, existing)
    const order =
      existing.reduce((max, type) => Math.max(max, type.order), -1) + 1
    const type: DocumentType = {
      id,
      sigla: sigla.trim(),
      nome: nome.trim(),
      parentTypeId: null,
      order,
      seed: false,
    }
    set((state) => ({ types: [...state.types, type] }))
    return id
  },

  renameDocType: (id, patch) =>
    set((state) => ({
      types: state.types.map((type) =>
        type.id === id && !type.seed
          ? {
              ...type,
              sigla: patch.sigla?.trim() || type.sigla,
              nome: patch.nome?.trim() || type.nome,
            }
          : type
      ),
    })),

  deleteDocType: (id) =>
    set((state) => ({
      types: state.types.filter((type) => !(type.id === id && !type.seed)),
    })),
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
