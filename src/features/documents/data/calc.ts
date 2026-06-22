import { type ItemRow, formatBRL, formatQuantity, parseNumber } from './items'
import {
  type CalcToken,
  type DocumentData,
  type FieldDefinition,
  type ItemColumnDef,
  type ModelDefinition,
} from './templates'

/**
 * Avaliação de campos calculados (input 'calculated'). Parser próprio e SEGURO
 * (sem `eval`): descida recursiva com precedência (× ÷ antes de + −) e
 * parênteses. Tudo derivado — nada é armazenado. Convenções:
 * - fonte vazia/não-numérica, ÷0, ciclo ou fórmula malformada => `null` ("—");
 * - um calculado pode referenciar number/currency E outros calculados, com
 *   detecção de ciclo via o conjunto `visiting`.
 */

/** Resolve o valor numérico de um campo referenciado. `null` = vazio/inválido/ciclo. */
function resolveFieldNumber(
  fieldId: string,
  model: ModelDefinition,
  data: DocumentData,
  visiting: Set<string>
): number | null {
  const field = model.fields[fieldId]
  if (!field) return null
  if (field.input === 'number' || field.input === 'currency') {
    const value = parseNumber(data[fieldId] ?? '')
    return Number.isNaN(value) ? null : value
  }
  if (field.input === 'calculated') {
    if (visiting.has(fieldId)) return null // ciclo
    return evaluateFormula(
      field.formula ?? [],
      model,
      data,
      new Set(visiting).add(fieldId)
    )
  }
  return null // referência a campo não-numérico
}

/** Avalia a lista de tokens. `null` em vazio/erro/incompleto. */
export function evaluateFormula(
  formula: CalcToken[],
  model: ModelDefinition,
  data: DocumentData,
  visiting: Set<string> = new Set()
): number | null {
  if (!formula.length) return null
  let pos = 0
  const peek = (): CalcToken | undefined => formula[pos]

  const parseExpr = (): number | null => {
    let left = parseTerm()
    if (left === null) return null
    for (;;) {
      const token = peek()
      if (token?.kind === 'op' && (token.op === '+' || token.op === '-')) {
        pos += 1
        const right = parseTerm()
        if (right === null) return null
        left = token.op === '+' ? left + right : left - right
      } else break
    }
    return left
  }

  const parseTerm = (): number | null => {
    let left = parseFactor()
    if (left === null) return null
    for (;;) {
      const token = peek()
      if (token?.kind === 'op' && (token.op === '*' || token.op === '/')) {
        pos += 1
        const right = parseFactor()
        if (right === null) return null
        if (token.op === '/') {
          if (right === 0) return null
          left = left / right
        } else {
          left = left * right
        }
      } else break
    }
    return left
  }

  const parseFactor = (): number | null => {
    const token = peek()
    if (!token) return null
    if (token.kind === 'paren' && token.paren === '(') {
      pos += 1
      const inner = parseExpr()
      if (inner === null) return null
      const close = peek()
      if (close?.kind !== 'paren' || close.paren !== ')') return null
      pos += 1
      return inner
    }
    if (token.kind === 'field') {
      pos += 1
      return resolveFieldNumber(token.fieldId, model, data, visiting)
    }
    return null // operador ou ')' inesperado
  }

  const result = parseExpr()
  if (result === null) return null
  if (pos !== formula.length) return null // sobraram tokens => malformado
  return Number.isFinite(result) ? result : null
}

/** Valor numérico de um campo calculado, ou `null` se incompleto/inválido. */
export function computeCalculatedValue(
  field: FieldDefinition,
  model: ModelDefinition,
  data: DocumentData
): number | null {
  if (field.input !== 'calculated') return null
  return evaluateFormula(field.formula ?? [], model, data, new Set([field.id]))
}

/**
 * Validação ESTRUTURAL da fórmula (gramática), independente dos dados: operandos
 * e operadores se alternam, parênteses balanceados, ao menos um campo. Usada no
 * construtor para sinalizar fórmula incompleta/inválida.
 */
export function isFormulaWellFormed(formula: CalcToken[]): boolean {
  if (!formula.length) return false
  let expectOperand = true
  let depth = 0
  let hasField = false
  for (const token of formula) {
    if (token.kind === 'field') {
      if (!expectOperand) return false
      hasField = true
      expectOperand = false
    } else if (token.kind === 'op') {
      if (expectOperand) return false
      expectOperand = true
    } else if (token.paren === '(') {
      if (!expectOperand) return false
      depth += 1
    } else {
      if (expectOperand) return false
      depth -= 1
      if (depth < 0) return false
    }
  }
  return !expectOperand && depth === 0 && hasField
}

/** Fórmula referencia algum campo de moeda? Define se o resultado sai em R$. */
function referencesCurrency(
  formula: CalcToken[],
  model: ModelDefinition
): boolean {
  return formula.some(
    (token) =>
      token.kind === 'field' &&
      model.fields[token.fieldId]?.input === 'currency'
  )
}

/** Valor calculado formatado para exibição; "—" quando incompleto/inválido. */
export function formatCalculated(
  field: FieldDefinition,
  model: ModelDefinition,
  data: DocumentData
): string {
  const value = computeCalculatedValue(field, model, data)
  if (value === null) return '—'
  return referencesCurrency(field.formula ?? [], model)
    ? formatBRL(value)
    : formatQuantity(value)
}

const opSymbol: Record<'+' | '-' | '*' | '/', string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
}

/** Fórmula legível com os rótulos dos campos (construtor/preview). */
export function describeFormula(
  formula: CalcToken[],
  model: ModelDefinition
): string {
  if (!formula.length) return ''
  return formula
    .map((token) => {
      if (token.kind === 'field')
        return model.fields[token.fieldId]?.label ?? '?'
      if (token.kind === 'op') return opSymbol[token.op]
      return token.paren
    })
    .join(' ')
}

// --- Colunas calculadas da tabela de itens (reusam o avaliador acima) ---

/**
 * Pseudo-modelo a partir das colunas: cada coluna vira um "campo", para o
 * avaliador resolver as referências da fórmula por id de coluna (o `data` é o
 * mapa de células da linha).
 */
function columnsModel(columns: ItemColumnDef[]): ModelDefinition {
  const fields: Record<string, FieldDefinition> = {}
  for (const column of columns) {
    fields[column.id] = {
      id: column.id,
      label: column.label,
      input: column.type,
      formula: column.formula,
    }
  }
  return { fields } as ModelDefinition
}

/** Para o avaliador, a fórmula da coluna usa os mesmos tokens (refs = id de coluna). */
export function computeColumnValue(
  row: ItemRow,
  column: ItemColumnDef,
  columns: ItemColumnDef[]
): number | null {
  if (column.type === 'text') return null
  if (column.type === 'number' || column.type === 'currency') {
    const value = parseNumber(row.cells[column.id] ?? '')
    return Number.isNaN(value) ? null : value
  }
  return evaluateFormula(
    column.formula ?? [],
    columnsModel(columns),
    row.cells,
    new Set([column.id])
  )
}

/** Coluna monetária? (currency, ou calculada que referencia uma coluna currency.) */
export function isMonetaryColumn(
  column: ItemColumnDef,
  columns: ItemColumnDef[]
): boolean {
  if (column.type === 'currency') return true
  if (column.type === 'calculated') {
    return (column.formula ?? []).some(
      (token) =>
        token.kind === 'field' &&
        columns.find((c) => c.id === token.fieldId)?.type === 'currency'
    )
  }
  return false
}

/** Valor de exibição de uma célula; calculada incompleta => "—". */
export function formatColumnCell(
  row: ItemRow,
  column: ItemColumnDef,
  columns: ItemColumnDef[]
): string {
  if (column.type === 'text') return row.cells[column.id] ?? ''
  const value = computeColumnValue(row, column, columns)
  if (value === null) return column.type === 'calculated' ? '—' : ''
  return isMonetaryColumn(column, columns)
    ? formatBRL(value)
    : formatQuantity(value)
}

/**
 * Colunas que recebem "Total geral" no rodapé: as calculadas e as de moeda que
 * NÃO são referenciadas por nenhuma coluna calculada (evita somar, por ex., o
 * "Preço unitário" além do "Total").
 */
export function summableColumns(columns: ItemColumnDef[]): ItemColumnDef[] {
  const referenced = new Set<string>()
  for (const column of columns) {
    if (column.type === 'calculated') {
      for (const token of column.formula ?? []) {
        if (token.kind === 'field') referenced.add(token.fieldId)
      }
    }
  }
  return columns.filter(
    (column) =>
      column.type === 'calculated' ||
      (column.type === 'currency' && !referenced.has(column.id))
  )
}

/** Soma de uma coluna ao longo das linhas (valores nulos contam como 0). */
export function columnSum(
  rows: ItemRow[],
  column: ItemColumnDef,
  columns: ItemColumnDef[]
): number {
  return rows.reduce(
    (sum, row) => sum + (computeColumnValue(row, column, columns) ?? 0),
    0
  )
}

/** Linha vazia para o editor (células em branco). */
export function emptyItemRow(): ItemRow {
  return { id: crypto.randomUUID(), cells: {} }
}
