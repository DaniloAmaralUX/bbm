/**
 * Itens da contratação (TR): linhas estruturadas guardadas como JSON dentro do
 * valor string do campo `items` (tipo de input `itemsTable`). O resto do motor
 * trata o valor como string opaca; o editor e o artefato usam estes helpers
 * para ler/escrever e formatar. Módulo puro (sem dependência de templates.ts).
 */
export type ItemRow = {
  id: string
  description: string
  unit: string
  quantity: number
  unitPrice: number
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const numberFormatter = new Intl.NumberFormat('pt-BR')

/** Formata um valor em reais (R$ 1.234,56). */
export function formatBRL(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}

/** Formata uma quantidade (pt-BR). */
export function formatQuantity(value: number): string {
  return numberFormatter.format(Number.isFinite(value) ? value : 0)
}

function isItemRow(value: unknown): value is ItemRow {
  if (typeof value !== 'object' || value === null) return false
  const row = value as Record<string, unknown>
  return (
    typeof row.id === 'string' &&
    typeof row.description === 'string' &&
    typeof row.unit === 'string' &&
    typeof row.quantity === 'number' &&
    typeof row.unitPrice === 'number'
  )
}

/** Lê o valor (JSON) do campo de itens; retorna [] em vazio, erro ou forma inválida. */
export function parseItems(value: string): ItemRow[] {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isItemRow)
  } catch {
    return []
  }
}

/** Serializa as linhas para o valor string do campo (vazio quando não há linhas). */
export function serializeItems(rows: ItemRow[]): string {
  return rows.length ? JSON.stringify(rows) : ''
}

export function rowTotal(row: ItemRow): number {
  return row.quantity * row.unitPrice
}

export function itemsTotal(rows: ItemRow[]): number {
  return rows.reduce((sum, row) => sum + rowTotal(row), 0)
}

/** Cria uma linha vazia para o editor. */
export function emptyItem(): ItemRow {
  return {
    id: crypto.randomUUID(),
    description: '',
    unit: '',
    quantity: 1,
    unitPrice: 0,
  }
}

/**
 * Sugestão mockada de itens (apoio de IA por campo, RF-11). Conteúdo neutro e
 * plausível de compras públicas; o usuário ajusta descrições, unidades,
 * quantidades e preços conforme o objeto.
 */
export function suggestedItems(): ItemRow[] {
  return [
    {
      id: crypto.randomUUID(),
      description: 'Implantação e configuração da solução',
      unit: 'serviço',
      quantity: 1,
      unitPrice: 18000,
    },
    {
      id: crypto.randomUUID(),
      description: 'Licença de uso (assinatura anual)',
      unit: 'unidade',
      quantity: 50,
      unitPrice: 480,
    },
    {
      id: crypto.randomUUID(),
      description: 'Suporte técnico e manutenção',
      unit: 'mês',
      quantity: 12,
      unitPrice: 1500,
    },
  ]
}
