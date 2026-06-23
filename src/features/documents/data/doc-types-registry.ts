/**
 * Semente do registry de tipos de documento (F2).
 *
 * Modulo-folha de proposito unico: so dados literais, sem importar modelos,
 * store ou doc-type. Isso quebra o ciclo de import doc-type -> store -> semente
 * (a semente nao volta para doc-type). Os tipos DFD/ETP/TR sao a carga inicial
 * que reproduz a cadeia da Fase 1 byte-a-byte; tipos novos (Sustentacao) entram
 * em runtime pelo store.
 */

/** Um tipo de documento como dado editavel (substitui o union fixo `DocType`). */
export type DocumentType = {
  /** Id estavel; tambem o valor gravado em `TRItem.docType` e `ModelDefinition.docType`. */
  id: string
  /** Sigla canonica (glossario). Uso em chips, titulos curtos e codigos. Ex.: 'DFD'. */
  sigla: string
  /** Nome por extenso canonico (glossario). Uso em cabecalhos e artefato oficial. */
  nome: string
  /** Tipo ancestral na cadeia (a heranca sobe por aqui), ou `null` na raiz/avulso. */
  parentTypeId: string | null
  /** Ordem estavel de exibicao (filtros, breakdown do dashboard, escolha de modelo). */
  order: number
  /** Tipos-semente (DFD/ETP/TR) sao imutaveis: nao podem ser editados nem excluidos. */
  seed?: boolean
}

/**
 * Carga inicial: a cadeia DFD -> ETP -> TR. `parentTypeId` modela a heranca
 * (ETP herda do DFD; TR herda do ETP); `order` fixa a posicao de exibicao.
 */
export const seedDocumentTypes: DocumentType[] = [
  {
    id: 'dfd',
    sigla: 'DFD',
    nome: 'Documento de Formalização da Demanda',
    parentTypeId: null,
    order: 0,
    seed: true,
  },
  {
    id: 'etp',
    sigla: 'ETP',
    nome: 'Estudo Técnico Preliminar',
    parentTypeId: 'dfd',
    order: 1,
    seed: true,
  },
  {
    id: 'tr',
    sigla: 'TR',
    nome: 'Termo de Referência',
    parentTypeId: 'etp',
    order: 2,
    seed: true,
  },
  // --- Tipos de DEMO (carga inicial editável) ---------------------------------
  // Tipos avulsos pré-carregados (seed:false => editáveis/removíveis) para
  // demonstrar a criação de modelos de QUALQUER tipo, além da cadeia DFD/ETP/TR.
  // Cada um tem um modelo publicado em templates.ts, então já nasce "pronto para
  // uso". Remover este bloco (e os modelos demo) deixa só a cadeia-semente.
  {
    id: 'laudo',
    sigla: 'LT',
    nome: 'Laudo Técnico',
    parentTypeId: null,
    order: 3,
    seed: false,
  },
  {
    id: 'contrato',
    sigla: 'TC',
    nome: 'Termo de Contrato',
    // Demo de cadeia custom: o contrato SEGUE o TR (estende a cadeia-semente).
    parentTypeId: 'tr',
    order: 4,
    seed: false,
  },
]
