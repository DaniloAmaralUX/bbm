import { type DocType, chainTypesOf } from './doc-type'
import { type TRItem } from './schema'

/**
 * Helpers puros da cadeia no nível de INSTÂNCIA (documentos salvos), navegando
 * pela relação `parentId` de `TRItem`. Complementam a herança em memória do
 * wizard (inheritance.ts): aqui resolvemos pai/filhos/linhagem e a regra de
 * dependência para iniciar o próximo documento da cadeia.
 */

/** Documento ancestral imediato (pai), ou `undefined` se for raiz/avulso. */
export function parentDocOf(item: TRItem, all: TRItem[]): TRItem | undefined {
  if (!item.parentId) return undefined
  return all.find((doc) => doc.id === item.parentId)
}

/** Documentos que apontam para `id` como pai (filhos diretos). */
export function childrenOf(id: string, all: TRItem[]): TRItem[] {
  return all.filter((doc) => doc.parentId === id)
}

/** Um documento está concluído quando aprovado (único estado terminal). */
export function isConcluded(item: TRItem): boolean {
  return item.status === 'approved'
}

/** Tipo do próximo documento da cadeia (dfd -> etp -> tr), ou `null` no fim. */
export function nextChildTypeOf(item: TRItem): DocType | null {
  const chain = chainTypesOf(item.docType)
  const index = chain.indexOf(item.docType)
  return chain[index + 1] ?? null
}

/**
 * Pode-se iniciar o documento dependente a partir de `parent`? Exige que exista
 * um próximo tipo na cadeia E que o pai esteja concluído (libera o próximo).
 */
export function canStartChildOf(parent: TRItem): boolean {
  return nextChildTypeOf(parent) !== null && isConcluded(parent)
}

/**
 * Linhagem completa de um documento: ancestrais + o próprio + descendentes,
 * ordenados pela cadeia (DFD -> ETP -> TR). Para documentos avulsos retorna só
 * o próprio. Assume cadeia linear (no máximo um filho por documento no mock).
 */
export function chainOf(item: TRItem, all: TRItem[]): TRItem[] {
  const byId = new Map<string, TRItem>()

  // Sobe pelos ancestrais.
  let ancestor: TRItem | undefined = item
  while (ancestor) {
    byId.set(ancestor.id, ancestor)
    ancestor = parentDocOf(ancestor, all)
  }

  // Desce pelos descendentes (primeiro filho de cada nível).
  let descendant: TRItem | undefined = childrenOf(item.id, all)[0]
  while (descendant) {
    byId.set(descendant.id, descendant)
    descendant = childrenOf(descendant.id, all)[0]
  }

  const order = chainTypesOf(item.docType)
  return [...byId.values()].sort(
    (a, b) => order.indexOf(a.docType) - order.indexOf(b.docType)
  )
}

/**
 * Papel do documento quanto ao vínculo de cadeia, para filtro na listagem:
 * - `root`: início de cadeia (todo DFD encabeça uma cadeia);
 * - `linked`: parte da cadeia (ETP/TR com pai registrado);
 * - `standalone`: avulso (ETP/TR sem vínculo de cadeia registrado).
 */
export type ChainRole = 'root' | 'linked' | 'standalone'

export const chainRoleValues = ['root', 'linked', 'standalone'] as const

export function chainRole(item: TRItem): ChainRole {
  if (item.docType === 'dfd') return 'root'
  if (item.parentId) return 'linked'
  return 'standalone'
}

export const chainRoleLabels: Record<ChainRole, string> = {
  root: 'Início de cadeia',
  linked: 'Parte da cadeia',
  standalone: 'Avulso',
}
