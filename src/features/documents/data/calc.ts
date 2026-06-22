import { formatBRL, formatQuantity, parseNumber } from './items'
import {
  type CalcToken,
  type DocumentData,
  type FieldDefinition,
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
