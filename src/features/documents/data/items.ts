/**
 * Linhas da tabela de itens (campo `itemsTable`): guardadas como JSON no valor
 * string do campo. Cada linha tem um `id` e um mapa célula-por-coluna
 * (`cells[colId] = valor string`). As colunas são definidas no modelo
 * (`ItemColumnDef`); este módulo é puro e agnóstico às colunas — a lógica
 * dependente de colunas (linha vazia, cálculo por linha, totais) vive em
 * `calc.ts`. `parseItems` migra o formato fixo legado (description/unit/
 * quantity/unitPrice) para o mapa de células das colunas padrão.
 */
export type ItemRow = { id: string; cells: Record<string, string> }

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

/**
 * Lê um número de uma string. Aceita ponto ("1234.56") e vírgula decimal pt-BR
 * ("1234,56"). Retorna `NaN` para vazio/forma inválida. Base comum dos campos
 * numéricos/moeda e das colunas/itens calculados.
 */
export function parseNumber(value: string): number {
  if (typeof value !== 'string') return NaN
  const trimmed = value.trim()
  if (!trimmed) return NaN
  const n = Number(trimmed.replace(',', '.'))
  return Number.isFinite(n) ? n : NaN
}

/** Normaliza uma linha desserializada para `{id, cells}`, migrando o formato legado. */
function normalizeRow(value: unknown): ItemRow | null {
  if (typeof value !== 'object' || value === null) return null
  const row = value as Record<string, unknown>
  const id = typeof row.id === 'string' ? row.id : crypto.randomUUID()

  if (typeof row.cells === 'object' && row.cells !== null) {
    const cells: Record<string, string> = {}
    for (const [key, cell] of Object.entries(
      row.cells as Record<string, unknown>
    )) {
      cells[key] = typeof cell === 'string' ? cell : String(cell ?? '')
    }
    return { id, cells }
  }

  // Formato fixo legado -> células das colunas padrão (total era derivado).
  if ('description' in row || 'unitPrice' in row || 'quantity' in row) {
    return {
      id,
      cells: {
        description: typeof row.description === 'string' ? row.description : '',
        unit: typeof row.unit === 'string' ? row.unit : '',
        quantity: row.quantity != null ? String(row.quantity) : '',
        unitPrice: row.unitPrice != null ? String(row.unitPrice) : '',
      },
    }
  }
  return null
}

/** Lê o valor (JSON) do campo de itens; retorna [] em vazio, erro ou forma inválida. */
export function parseItems(value: string): ItemRow[] {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(normalizeRow)
      .filter((row): row is ItemRow => row !== null)
  } catch {
    return []
  }
}

/** Serializa as linhas para o valor string do campo (vazio quando não há linhas). */
export function serializeItems(rows: ItemRow[]): string {
  return rows.length ? JSON.stringify(rows) : ''
}

/**
 * Sugestão mockada de itens (apoio de IA por campo, RF-11), nas colunas padrão
 * (descrição/unidade/quantidade/preço unitário). O total é coluna calculada.
 */
export function suggestedItems(): ItemRow[] {
  const make = (
    description: string,
    unit: string,
    quantity: number,
    unitPrice: number
  ): ItemRow => ({
    id: crypto.randomUUID(),
    cells: {
      description,
      unit,
      quantity: String(quantity),
      unitPrice: String(unitPrice),
    },
  })
  return [
    make('Implantação e configuração da solução', 'serviço', 1, 18000),
    make('Licença de uso (assinatura anual)', 'unidade', 50, 480),
    make('Suporte técnico e manutenção', 'mês', 12, 1500),
  ]
}
