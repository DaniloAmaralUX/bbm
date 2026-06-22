import { create } from 'zustand'

/**
 * Registry de tipos de documento (F2 - "tipo como dado"). DFD/ETP/TR são carga
 * inicial (`seed`), com a relação de cadeia em `parentTypeId` (ETP->DFD,
 * TR->ETP). A Sustentação pode criar tipos LIVRES (Laudos, Termos, Contratos…),
 * que nascem standalone (`parentTypeId: null`, fora da cadeia). `doc-type.ts` lê
 * os rótulos e o pai daqui; a cadeia do wizard usa apenas os tipos-semente.
 */
export type DocumentType = {
  id: string
  /** Sigla curta para chips/títulos curtos (ex.: DFD). */
  sigla: string
  /** Nome por extenso (ex.: Documento de Formalização da Demanda). */
  nome: string
  /** Tipo ancestral na cadeia; null para raiz (DFD) ou tipo livre/standalone. */
  parentTypeId: string | null
  /** Tipo de carga inicial (não removível). */
  seed: boolean
}

const seedTypes: DocumentType[] = [
  {
    id: 'dfd',
    sigla: 'DFD',
    nome: 'Documento de Formalização da Demanda',
    parentTypeId: null,
    seed: true,
  },
  {
    id: 'etp',
    sigla: 'ETP',
    nome: 'Estudo Técnico Preliminar',
    parentTypeId: 'dfd',
    seed: true,
  },
  {
    id: 'tr',
    sigla: 'TR',
    nome: 'Termo de Referência',
    parentTypeId: 'etp',
    seed: true,
  },
]

type DocumentTypesState = {
  types: DocumentType[]
  /** Cria um tipo livre (standalone, fora da cadeia). Retorna o id novo. */
  createType: (nome: string) => string
  renameType: (id: string, nome: string) => void
  /** Remove um tipo livre (tipos-semente são preservados). */
  deleteType: (id: string) => void
}

function siglaFromName(nome: string): string {
  const first = nome.trim().split(/\s+/)[0] ?? ''
  return (first || 'DOC').toUpperCase().slice(0, 8)
}

function typeId(nome: string): string {
  const base = nome
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const rand = crypto.randomUUID().slice(0, 6)
  return `${base || 'tipo'}-${rand}`
}

export const useDocumentTypesStore = create<DocumentTypesState>()((set) => ({
  types: seedTypes,

  createType: (nome) => {
    const trimmed = nome.trim()
    const id = typeId(trimmed)
    const type: DocumentType = {
      id,
      sigla: siglaFromName(trimmed),
      nome: trimmed || 'Novo tipo',
      parentTypeId: null,
      seed: false,
    }
    set((state) => ({ types: [...state.types, type] }))
    return id
  },

  renameType: (id, nome) =>
    set((state) => ({
      types: state.types.map((type) =>
        type.id === id && !type.seed
          ? {
              ...type,
              nome: nome.trim() || type.nome,
              sigla: siglaFromName(nome),
            }
          : type
      ),
    })),

  deleteType: (id) =>
    set((state) => ({
      types: state.types.filter((type) => type.id !== id || type.seed),
    })),
}))

// --- Seletores puros (funcionam fora do React via getState) ---

export function getDocumentTypes(): DocumentType[] {
  return useDocumentTypesStore.getState().types
}

export function getDocumentType(id: string): DocumentType | undefined {
  return useDocumentTypesStore.getState().types.find((type) => type.id === id)
}
