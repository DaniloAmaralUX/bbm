import { docTypeFullLabel } from './doc-type'
import { type TRItem } from './schema'
import { type DocumentSection } from './templates'
import { trs } from './trs'

export function getTRById(trId?: string) {
  return trs.find((item) => item.id === trId) ?? trs[0]
}

// --- Builders de seção (espelham o layout dos modelos DFD/ETP/TR) ---

function prose(title: string, content: string): DocumentSection {
  return { kind: 'prose', title, content }
}

function keyValue(
  title: string,
  pairs: Array<[string, string]>
): DocumentSection {
  return {
    kind: 'keyValue',
    title,
    items: pairs.map(([label, value]) => ({ label, value })),
  }
}

function contextSection(tr: TRItem): DocumentSection {
  return keyValue('Contexto do documento', [
    ['Tipo de documento', docTypeFullLabel(tr.docType)],
    ['Unidade requisitante', tr.unit],
    ['Responsável', tr.owner],
  ])
}

function justification(tr: TRItem): string {
  return `A necessidade foi identificada pela ${tr.unit} e visa assegurar a continuidade e a qualidade do serviço público, com uso eficiente dos recursos e aderência ao planejamento da contratação.`
}

function dfdSections(tr: TRItem): DocumentSection[] {
  return [
    prose('1. Objeto', tr.summary),
    prose('2. Justificativa', justification(tr)),
    keyValue('3. Planejamento', [
      ['Data prevista', '30/06/2026'],
      ['Vínculo ao PCA', 'Item 12/2026 do Plano de Contratações Anual'],
    ]),
  ]
}

function etpSections(tr: TRItem): DocumentSection[] {
  return [
    prose('1. Objeto', tr.summary),
    prose('2. Justificativa', justification(tr)),
    prose(
      '3. Análise do problema',
      'O estudo caracteriza a necessidade, levanta os requisitos técnicos e estima os quantitativos com base no histórico de demanda da unidade.'
    ),
    prose(
      '4. Levantamento de mercado',
      'Foram consultadas contratações públicas anteriores e referências de preço para dimensionar a faixa de valores e as alternativas viáveis (apoio de IA previsto para a Fase 5).'
    ),
    keyValue('5. Solução e valor estimado', [
      ['Valor estimado', 'R$ 120.000,00'],
      [
        'Solução',
        'Alternativa técnica e economicamente mais vantajosa identificada no estudo.',
      ],
    ]),
    prose(
      '6. Conclusão',
      'A contratação é viável técnica e economicamente e está apta a prosseguir para o Termo de Referência.'
    ),
  ]
}

function trSections(tr: TRItem): DocumentSection[] {
  return [
    prose('1. Objeto', tr.summary),
    prose(
      '2. Solução',
      'Solução validada no Estudo Técnico Preliminar, detalhada nos requisitos e nas rotinas de execução abaixo.'
    ),
    prose(
      '3. Requisitos da contratação',
      'Requisitos técnicos, operacionais e de qualificação necessários ao cumprimento do objeto.'
    ),
    prose(
      '4. Execução e medição',
      'Rotinas de execução, entregas esperadas e critérios de aceite, medição e pagamento.'
    ),
    keyValue('5. Itens e modalidade', [
      ['Itens e quantidades', 'Conforme planilha de itens da contratação.'],
      ['Modalidade observada', 'Pregão eletrônico'],
    ]),
  ]
}

function sectionsForDocument(tr: TRItem): DocumentSection[] {
  const base =
    tr.docType === 'dfd'
      ? dfdSections(tr)
      : tr.docType === 'etp'
        ? etpSections(tr)
        : trSections(tr)
  return [contextSection(tr), ...base]
}

const baseComments = [
  {
    author: 'Fernanda Lopes',
    date: '07/04/2026',
    message:
      'Reforçar o critério de aceite para deixar explícito o marco de validação da entrega.',
  },
  {
    author: 'Carlos Henrique',
    date: '06/04/2026',
    message:
      'A justificativa está boa, mas vale destacar o impacto na continuidade do serviço.',
  },
]

export function getTRDocument(trId?: string) {
  const tr = getTRById(trId)

  return {
    ...tr,
    model: docTypeFullLabel(tr.docType),
    responsibleUnit: tr.unit,
    sections: sectionsForDocument(tr),
    comments: baseComments,
  }
}
