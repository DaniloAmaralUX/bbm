/**
 * Vocabulário do tipo de documento da fase preparatória.
 *
 * `DocType` é a dimensão de primeira classe que vai parametrizar modelo,
 * formulário, view e export ao longo da Fase 1. Neste PR (PR-1) entra só o
 * vocabulário; os consumidores (ModelDefinition, wizard, rotas) chegam no
 * PR-3/PR-5. Por isso este arquivo está listado como `entry` no knip.json:
 * é um módulo-base introduzido antes do seu primeiro consumidor. Quando o PR-3
 * passar a importar `DocType`, essa entrada pode ser removida.
 */

export type DocType = 'dfd' | 'etp' | 'tr'

/** Tipos na ordem da cadeia: DFD -> ETP -> TR. */
export const docTypes: readonly DocType[] = ['dfd', 'etp', 'tr']

/** Sigla canônica (glossário). Uso em chips, títulos curtos e códigos. */
const docTypeLabels: Record<DocType, string> = {
  dfd: 'DFD',
  etp: 'ETP',
  tr: 'TR',
}

/** Nome por extenso canônico (glossário). Uso em cabeçalhos e artefato oficial. */
const docTypeFullLabels: Record<DocType, string> = {
  dfd: 'Documento de Formalização da Demanda',
  etp: 'Estudo Técnico Preliminar',
  tr: 'Termo de Referência',
}

export function docTypeLabel(type: DocType): string {
  return docTypeLabels[type]
}

export function docTypeFullLabel(type: DocType): string {
  return docTypeFullLabels[type]
}
