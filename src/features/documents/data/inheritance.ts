import {
  type DocType,
  docTypes,
  parentOf,
} from '@/features/documents/data/doc-type'
import {
  type FieldDefinition,
  type ModelDefinition,
} from '@/features/documents/data/templates'
import {
  getModelById,
  getModelForDocType,
} from '@/features/models/store/use-models-store'

/**
 * Origem do valor de um campo na cadeia DFD -> ETP -> TR.
 * - `own`: valor proprio do documento (campo nao herdavel ou preenchido no
 *   documento de origem da cadeia).
 * - `inherited`: valor que veio de um ancestral via heranca, sem edicao local.
 * - `adjusted`: valor herdado que foi editado no documento atual; nao e mais
 *   sobrescrito pela sincronizacao de heranca.
 */
export type FieldOrigin = 'own' | 'inherited' | 'adjusted'

/** Celula de um campo: valor + proveniencia na cadeia (espelha {v, o} do protótipo). */
export type FieldCell = {
  value: string
  origin: FieldOrigin
  /** Tipo do ancestral de onde o valor herdado/ajustado veio. */
  inheritedFrom?: DocType
}

/** Mapa de campos de um documento: id do campo -> celula. */
export type DocumentCells = Record<string, FieldCell>

/** Estado completo da cadeia em memoria. */
export type ChainState = {
  current: DocType
  done: Record<DocType, boolean>
  /** Celulas por tipo de documento. */
  cells: Record<DocType, DocumentCells>
  /** Modelo publicado escolhido para cada tipo (id). Ha varios por tipo. */
  selectedModelId: Record<DocType, string>
}

/**
 * Resolve o modelo em uso para um documento da cadeia: o selecionado (se ainda
 * existir) ou o publicado padrao do tipo. Garante retorno sempre definido.
 */
export function resolveStepModel(
  state: ChainState,
  docType: DocType
): ModelDefinition {
  return (
    getModelById(state.selectedModelId[docType]) ?? getModelForDocType(docType)
  )
}

/** Ids dos campos herdaveis (marcados `inheritable`) de um modelo. */
function inheritableFieldIds(model: ModelDefinition): string[] {
  return Object.values(model.fields)
    .filter((field) => field.inheritable)
    .map((field) => field.id)
}

/** Cria uma celula propria (origin 'own') com o valor informado. */
function ownCell(value: string): FieldCell {
  return { value, origin: 'own' }
}

/**
 * Inicializa as celulas de um documento a partir das chaves de um modelo, com
 * os valores informados em `seed` (campos sem seed comecam vazios e proprios).
 */
function createCellsForModel(
  model: ModelDefinition,
  seed: Record<string, string> = {}
): DocumentCells {
  const cells: DocumentCells = {}
  Object.keys(model.fields).forEach((fieldId) => {
    cells[fieldId] = ownCell(seed[fieldId] ?? '')
  })
  return cells
}

/**
 * Resolve o valor herdado de um campo: sobe a cadeia (parentOf) ate achar o
 * ancestral mais proximo cuja celula tem valor preenchido. Espelha
 * `inheritedValue` do protótipo.
 */
export function resolveInheritedValue(
  state: ChainState,
  docType: DocType,
  fieldId: string
): { value: string; from: DocType } | null {
  let ancestor = parentOf(docType)
  while (ancestor) {
    const cell = state.cells[ancestor]?.[fieldId]
    if (cell && cell.value.trim() !== '') {
      return { value: cell.value, from: ancestor }
    }
    ancestor = parentOf(ancestor)
  }
  return null
}

/**
 * Garante que os campos herdaveis de um documento reflitam a heranca atual da
 * cadeia. Campos `adjusted` NUNCA sao sobrescritos. Retorna um novo mapa de
 * celulas (imutavel). Espelha `syncInheritance` do protótipo.
 */
function syncDocumentInheritance(
  state: ChainState,
  docType: DocType
): DocumentCells {
  if (parentOf(docType) === null) return state.cells[docType]

  const model = resolveStepModel(state, docType)
  const cells = { ...state.cells[docType] }
  for (const fieldId of inheritableFieldIds(model)) {
    const cell = cells[fieldId] ?? ownCell('')
    if (cell.origin === 'adjusted') continue
    const inherited = resolveInheritedValue(state, docType, fieldId)
    if (inherited) {
      cells[fieldId] = {
        value: inherited.value,
        origin: 'inherited',
        inheritedFrom: inherited.from,
      }
    }
  }
  return cells
}

/**
 * Sincroniza a heranca de um documento e devolve um novo `ChainState` imutavel.
 * Use ao entrar em um documento ou ao concluir o ancestral.
 */
export function inheritCommonFields(
  state: ChainState,
  docType: DocType
): ChainState {
  const nextCells = syncDocumentInheritance(state, docType)
  if (nextCells === state.cells[docType]) return state
  return {
    ...state,
    cells: { ...state.cells, [docType]: nextCells },
  }
}

/**
 * Troca o modelo publicado usado por um documento da cadeia: recria as celulas
 * a partir do novo modelo, preservando os valores ja digitados por id de campo,
 * e re-sincroniza a heranca. Imutavel.
 */
export function selectModelForStep(
  state: ChainState,
  docType: DocType,
  modelId: string
): ChainState {
  const model = getModelById(modelId)
  if (!model || model.docType !== docType) return state

  const previousValues: Record<string, string> = {}
  for (const [fieldId, cell] of Object.entries(state.cells[docType] ?? {})) {
    previousValues[fieldId] = cell.value
  }

  const next: ChainState = {
    ...state,
    selectedModelId: { ...state.selectedModelId, [docType]: modelId },
    cells: {
      ...state.cells,
      [docType]: createCellsForModel(model, previousValues),
    },
  }
  return inheritCommonFields(next, docType)
}

/**
 * Edita o valor de um campo do documento atual. Um campo herdado vira
 * `adjusted` ao ser editado; demais origens mantem sua natureza. Imutavel.
 */
export function setCellValue(
  state: ChainState,
  docType: DocType,
  fieldId: string,
  value: string
): ChainState {
  const cell = state.cells[docType]?.[fieldId] ?? ownCell('')
  const nextOrigin: FieldOrigin =
    cell.origin === 'inherited' ? 'adjusted' : cell.origin
  const nextCell: FieldCell = { ...cell, value, origin: nextOrigin }
  return {
    ...state,
    cells: {
      ...state.cells,
      [docType]: { ...state.cells[docType], [fieldId]: nextCell },
    },
  }
}

/**
 * Restaura um campo ajustado para o valor herdado do ancestral mais proximo.
 * Imutavel. Espelha `revert` do protótipo. Retorna o estado inalterado se nao
 * houver valor herdado disponivel.
 */
export function revertCellToInherited(
  state: ChainState,
  docType: DocType,
  fieldId: string
): ChainState {
  const inherited = resolveInheritedValue(state, docType, fieldId)
  if (!inherited) return state
  const nextCell: FieldCell = {
    value: inherited.value,
    origin: 'inherited',
    inheritedFrom: inherited.from,
  }
  return {
    ...state,
    cells: {
      ...state.cells,
      [docType]: { ...state.cells[docType], [fieldId]: nextCell },
    },
  }
}

/**
 * Conclui o documento atual: marca `done`, e sincroniza a heranca do proximo
 * documento da cadeia (se houver). Imutavel. Espelha o `conclude` do protótipo.
 */
export function concludeDocument(
  state: ChainState,
  docType: DocType
): ChainState {
  const done = { ...state.done, [docType]: true }
  let next: ChainState = { ...state, done }
  const order = docTypes.indexOf(docType)
  const successor = docTypes[order + 1]
  if (successor) next = inheritCommonFields(next, successor)
  return next
}

/** Um documento esta bloqueado quando seu ancestral imediato nao foi concluido. */
export function isDocumentLocked(state: ChainState, docType: DocType): boolean {
  const parent = parentOf(docType)
  if (!parent) return false
  return !state.done[parent]
}

/** Converte as celulas de um documento no `DocumentData` plano (id -> valor). */
export function cellsToDocumentData(
  cells: DocumentCells
): Record<string, string> {
  const data: Record<string, string> = {}
  for (const [fieldId, cell] of Object.entries(cells)) {
    data[fieldId] = cell.value
  }
  return data
}

/** Rotulo de linhagem para a origem de um campo (copy do glossario). */
export function originLabel(
  cell: FieldCell,
  docType: DocType,
  docLabelOf: (type: DocType) => string
): string {
  if (cell.origin === 'inherited' && cell.inheritedFrom) {
    return `Herdado de ${docLabelOf(cell.inheritedFrom)}`
  }
  if (cell.origin === 'adjusted') {
    const from = cell.inheritedFrom ? docLabelOf(cell.inheritedFrom) : 'cadeia'
    return `Ajustado (origem: ${from})`
  }
  return `Proprio do ${docLabelOf(docType)}`
}

/**
 * Cria o estado inicial da cadeia: DFD semeado com dados realistas de
 * prefeitura; ETP e TR comecam vazios e ja recebem a heranca dos campos comuns.
 * Cada tipo comeca com o modelo publicado padrao selecionado.
 */
export function createInitialChainState(): ChainState {
  const dfdSeed: Record<string, string> = {
    requestingUnit: 'Secretaria de Administração',
    responsible: 'Ana Ribeiro',
    object:
      'Aquisição de mobiliário corporativo para reequipar as unidades de atendimento ao público, com entrega e montagem inclusas.',
    justification:
      'O mobiliário atual está depreciado e compromete a ergonomia e o atendimento. A renovação melhora as condições de trabalho e a experiência do cidadão.',
    expectedDate: '30/06/2026',
    pcaLink: 'Item 12/2026 do Plano de Contratações Anual',
  }

  const selectedModelId: Record<DocType, string> = {
    dfd: getModelForDocType('dfd').id,
    etp: getModelForDocType('etp').id,
    tr: getModelForDocType('tr').id,
  }

  let state: ChainState = {
    current: 'dfd',
    done: { dfd: false, etp: false, tr: false },
    selectedModelId,
    cells: {
      dfd: createCellsForModel(getModelForDocType('dfd'), dfdSeed),
      etp: createCellsForModel(getModelForDocType('etp')),
      tr: createCellsForModel(getModelForDocType('tr')),
    },
  }

  // Semeia a heranca inicial nos descendentes (campos comuns ja aparecem como
  // herdados antes mesmo da conclusao, como no protótipo).
  state = inheritCommonFields(state, 'etp')
  state = inheritCommonFields(state, 'tr')
  return state
}

/** Indica se um campo participa da heranca da cadeia (marcado `inheritable`). */
export function isInheritableField(field: FieldDefinition): boolean {
  return Boolean(field.inheritable)
}
