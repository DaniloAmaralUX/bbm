/**
 * Vocabulario do tipo de documento da fase preparatoria.
 *
 * F2: `DocType` deixou de ser um union fixo e passou a ser o id de um tipo no
 * registry editavel (`use-doc-types-store`). Os helpers abaixo leem do registry
 * via `getState()` — o mesmo padrao que `inheritance.ts` ja usa com
 * `getModelForDocType`/`getModelById`. DFD/ETP/TR sao a carga-semente; tipos
 * novos (Sustentacao) entram em runtime sem tocar este arquivo.
 *
 * Segue listado como `entry` no knip.json: e a fronteira do vocabulario de
 * tipos, consumida amplamente, e ancora a cadeia de import doc-type -> store ->
 * semente (esta ultima e um modulo-folha, sem volta para ca).
 */
import { type DocumentType } from '@/features/documents/data/doc-types-registry'
import {
  getAllDocTypes,
  getDocTypeById,
} from '@/features/documents/store/use-doc-types-store'

export type { DocumentType }

/** Id de um tipo no registry (ex.: 'dfd', 'etp', 'tr', ou um tipo criado depois). */
export type DocType = string

/** Sigla canonica (glossario). Fallback no proprio id se o tipo nao existir. */
export function docTypeLabel(type: DocType): string {
  return getDocTypeById(type)?.sigla ?? type
}

/** Nome por extenso canonico (glossario). Fallback no proprio id se ausente. */
export function docTypeFullLabel(type: DocType): string {
  return getDocTypeById(type)?.nome ?? type
}

/**
 * Tipo do documento ancestral (pai) na cadeia: o ETP herda do DFD e o TR herda
 * do ETP. A heranca sobe por esta relacao ate achar um ancestral com valor.
 * `null` para a raiz da cadeia (DFD) ou um tipo avulso.
 */
export function parentOf(type: DocType): DocType | null {
  return getDocTypeById(type)?.parentTypeId ?? null
}

/**
 * Sequencia linear ordenada da cadeia a que um tipo pertence: sobe ate a raiz
 * (`parentTypeId === null`) e desce pelo primeiro filho de cada nivel. Para a
 * semente DFD/ETP/TR retorna `['dfd','etp','tr']` qualquer que seja o tipo dado;
 * para um tipo avulso (sem pai e sem filhos) retorna so ele. Guarda contra
 * ciclos em `parentTypeId` (Set de ids visitados) por seguranca de dados.
 */
export function chainTypesOf(type: DocType): DocType[] {
  const all = getAllDocTypes()
  const byId = new Map(all.map((item) => [item.id, item]))

  // Sobe ate a raiz da cadeia.
  let rootId = type
  const seenUp = new Set<string>([type])
  for (;;) {
    const parentId = byId.get(rootId)?.parentTypeId
    if (!parentId || seenUp.has(parentId)) break
    seenUp.add(parentId)
    rootId = parentId
  }

  // Desce pelo primeiro filho de cada nivel (cadeia linear no mock).
  const chain: DocType[] = []
  const seenDown = new Set<string>()
  let currentId: string | undefined = rootId
  while (currentId && !seenDown.has(currentId)) {
    seenDown.add(currentId)
    chain.push(currentId)
    currentId = all.find((item) => item.parentTypeId === currentId)?.id
  }
  return chain
}

/** Todos os tipos registrados, ordenados (filtros, breakdown, escolha de modelo). */
export function allDocTypes(): DocType[] {
  return getAllDocTypes().map((item) => item.id)
}

/**
 * Um tipo encabeca uma cadeia? Verdadeiro quando nao tem pai e tem ao menos um
 * descendente no registry (ex.: DFD). Distingue a raiz de uma cadeia ramificada
 * de um tipo avulso (sem pai e sem filhos), que nao e raiz de nada. Base do
 * papel de cadeia (chainRole), do funil do dashboard e do trilho de linhagem.
 */
export function isChainRootType(type: DocType): boolean {
  return parentOf(type) === null && chainTypesOf(type).length > 1
}

/**
 * `ancestorId` e ancestral de `typeId` subindo por `parentTypeId`? Guarda contra
 * ciclos (Set de visitados). Usado para validar a escolha de pai de um tipo.
 */
export function isAncestorType(ancestorId: DocType, typeId: DocType): boolean {
  let current = parentOf(typeId)
  const seen = new Set<string>([typeId])
  while (current && !seen.has(current)) {
    if (current === ancestorId) return true
    seen.add(current)
    current = parentOf(current)
  }
  return false
}

/**
 * `parentId` pode ser o pai de `childId` sem criar ciclo? Falso para o proprio
 * tipo ou quando `parentId` ja e descendente de `childId`. Usado pela tela de
 * tipos para filtrar as opcoes de "Segue de".
 */
export function canBeParent(childId: DocType, parentId: DocType): boolean {
  if (childId === parentId) return false
  return !isAncestorType(childId, parentId)
}
