import { getDocumentType } from './use-document-types-store'

/**
 * Vocabulário do tipo de documento. Agora o tipo é DADO (registry em
 * `use-document-types-store`): DFD/ETP/TR são carga inicial e o usuário pode
 * criar tipos livres. Por isso `DocType` é um id (`string`); os rótulos e o pai
 * da cadeia são lidos do registry. A CADEIA do wizard usa apenas os tipos-
 * semente, na ordem abaixo (DFD -> ETP -> TR) — tipos livres são standalone.
 */
export type DocType = string

/** Tipos da cadeia, em ordem (DFD -> ETP -> TR). Tipos livres não entram aqui. */
export const docTypes: readonly DocType[] = ['dfd', 'etp', 'tr']

/** Sigla canônica (glossário); cai no próprio id se o tipo não existir. */
export function docTypeLabel(type: DocType): string {
  return getDocumentType(type)?.sigla ?? type
}

/** Nome por extenso canônico (glossário); cai no próprio id se não existir. */
export function docTypeFullLabel(type: DocType): string {
  return getDocumentType(type)?.nome ?? type
}

/**
 * Tipo do documento ancestral (pai) na cadeia: o ETP herda do DFD e o TR herda
 * do ETP. Lido do registry (`parentTypeId`); `null` para o DFD, raiz da cadeia,
 * e para tipos livres/standalone.
 */
export function parentOf(type: DocType): DocType | null {
  return getDocumentType(type)?.parentTypeId ?? null
}
