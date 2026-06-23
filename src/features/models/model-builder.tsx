import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Link2,
  Pencil,
  Plus,
  Send,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/shared/layout/header'
import { HeaderActions } from '@/shared/layout/header-actions'
import { Main } from '@/shared/layout/main'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Separator } from '@/shared/ui/separator'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import {
  describeFormula,
  isFormulaWellFormed,
} from '@/features/documents/data/calc'
import { docTypeLabel, parentOf } from '@/features/documents/data/doc-type'
import {
  DEFAULT_ITEM_COLUMNS,
  type CalcToken,
  type FieldDefinition,
  type FieldInputType,
  type ItemColumnDef,
  type ItemColumnType,
  type ModelDefinition,
  type SectionDefinition,
} from '@/features/documents/data/templates'
import { ModelPreview } from './model-preview'
import { useModelsStore } from './store/use-models-store'

const inputTypeLabels: Record<FieldInputType, string> = {
  text: 'Texto curto',
  textarea: 'Texto longo',
  select: 'Seleção',
  date: 'Data',
  email: 'E-mail',
  number: 'Número',
  currency: 'Moeda (R$)',
  calculated: 'Calculado',
  itemsTable: 'Tabela de itens',
}

const inputTypeOrder: FieldInputType[] = [
  'text',
  'textarea',
  'select',
  'date',
  'email',
  'number',
  'currency',
  'calculated',
  'itemsTable',
]

type OptionRow = { id: string; label: string }

/**
 * Editor das opções de um campo de seleção: uma linha de form por opção
 * (Input + reordenar + remover), em vez do antigo textarea com shift+enter.
 * Persiste só opções limpas (sem vazias, sem duplicadas; value = label), pois o
 * Select do wizard exige value não-vazio. Vazias/duplicadas ficam marcadas mas
 * não vão para o modelo.
 */
function OptionsEditor({
  modelId,
  field,
}: {
  modelId: string
  field: FieldDefinition
}) {
  const updateField = useModelsStore((state) => state.updateField)
  const [rows, setRows] = useState<OptionRow[]>(() =>
    (field.options ?? []).map((option) => ({
      id: crypto.randomUUID(),
      label: option.label,
    }))
  )

  function persist(next: OptionRow[]) {
    setRows(next)
    const seen = new Set<string>()
    const options: Array<{ label: string; value: string }> = []
    for (const row of next) {
      const label = row.label.trim()
      if (!label || seen.has(label)) continue
      seen.add(label)
      options.push({ label, value: label })
    }
    updateField(modelId, field.id, { options })
  }

  const counts = new Map<string, number>()
  for (const row of rows) {
    const label = row.label.trim()
    if (label) counts.set(label, (counts.get(label) ?? 0) + 1)
  }
  const lastIsEmpty = (rows[rows.length - 1]?.label.trim() ?? 'x') === ''

  const move = (index: number, delta: number) => {
    const target = index + delta
    const a = rows[index]
    const b = rows[target]
    if (!a || !b) return
    const next = [...rows]
    next[index] = b
    next[target] = a
    persist(next)
  }

  return (
    <Field>
      <FieldLabel>Opções da seleção</FieldLabel>
      {rows.length > 0 ? (
        <div className='flex flex-col gap-2'>
          {rows.map((row, index) => {
            const isDuplicate =
              row.label.trim() !== '' && (counts.get(row.label.trim()) ?? 0) > 1
            return (
              <Field key={row.id} data-invalid={isDuplicate || undefined}>
                <div className='flex items-center gap-2'>
                  <Input
                    value={row.label}
                    aria-invalid={isDuplicate || undefined}
                    aria-label={`Opção ${index + 1}`}
                    placeholder={`Opção ${index + 1}`}
                    onChange={(event) =>
                      persist(
                        rows.map((item) =>
                          item.id === row.id
                            ? { ...item, label: event.target.value }
                            : item
                        )
                      )
                    }
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='shrink-0 text-muted-foreground'
                    aria-label={`Mover opção ${index + 1} para cima`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ChevronUp aria-hidden='true' className='size-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='shrink-0 text-muted-foreground'
                    aria-label={`Mover opção ${index + 1} para baixo`}
                    disabled={index === rows.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ChevronDown aria-hidden='true' className='size-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='shrink-0 text-muted-foreground hover:text-destructive'
                    aria-label={`Remover opção ${index + 1}`}
                    onClick={() =>
                      persist(rows.filter((item) => item.id !== row.id))
                    }
                  >
                    <Trash2 aria-hidden='true' className='size-4' />
                  </Button>
                </div>
                {isDuplicate ? (
                  <FieldError>Opção duplicada - será ignorada.</FieldError>
                ) : null}
              </Field>
            )
          })}
        </div>
      ) : (
        <p className='text-sm text-muted-foreground'>
          Nenhuma opção ainda. Adicione a primeira abaixo.
        </p>
      )}
      <Button
        type='button'
        variant='outline'
        size='sm'
        className='w-fit rounded-xl'
        disabled={lastIsEmpty}
        onClick={() =>
          persist([...rows, { id: crypto.randomUUID(), label: '' }])
        }
      >
        <Plus aria-hidden='true' className='size-4' />
        Adicionar opção
      </Button>
      <FieldDescription>
        Cada opção é um valor que o requisitante poderá escolher. Vazias e
        duplicadas são ignoradas.
      </FieldDescription>
    </Field>
  )
}

const formulaOperators: Array<{ op: '+' | '-' | '*' | '/'; symbol: string }> = [
  { op: '+', symbol: '+' },
  { op: '-', symbol: '−' },
  { op: '*', symbol: '×' },
  { op: '/', symbol: '÷' },
]

/**
 * Montador de fórmula genérico (tokens): Select de candidatos + operadores +
 * parênteses + remover/limpar, com prévia legível e aviso de estrutura
 * inválida. Reusado pelo campo calculado (F4) e pela coluna calculada (F1) —
 * `candidates` são campos do modelo ou colunas da tabela.
 */
function FormulaBuilder({
  candidates,
  formula,
  onChange,
}: {
  candidates: Array<{ id: string; label: string }>
  formula: CalcToken[]
  onChange: (next: CalcToken[]) => void
}) {
  const append = (token: CalcToken) => onChange([...formula, token])
  const pseudoModel = {
    fields: Object.fromEntries(
      candidates.map((item) => [
        item.id,
        { id: item.id, label: item.label, input: 'number' },
      ])
    ),
  } as ModelDefinition
  const readable = describeFormula(formula, pseudoModel)
  const wellFormed = isFormulaWellFormed(formula)

  return (
    <>
      <div className='flex min-h-9 flex-wrap items-center gap-1.5 rounded-xl border bg-muted/20 px-3 py-2'>
        {formula.length ? (
          <span className='text-sm'>{readable}</span>
        ) : (
          <span className='text-sm text-muted-foreground'>
            Monte a fórmula com os itens e operadores abaixo.
          </span>
        )}
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        <Select
          value=''
          onValueChange={(fieldId) => append({ kind: 'field', fieldId })}
        >
          <SelectTrigger
            className='w-auto min-w-44'
            aria-label='Adicionar item à fórmula'
          >
            <SelectValue placeholder='Adicionar campo' />
          </SelectTrigger>
          <SelectContent>
            {candidates.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label || 'Sem rótulo'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formulaOperators.map(({ op, symbol }) => (
          <Button
            key={op}
            type='button'
            variant='outline'
            size='icon'
            aria-label={`Operador ${symbol}`}
            onClick={() => append({ kind: 'op', op })}
          >
            {symbol}
          </Button>
        ))}
        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='Abre parêntese'
          onClick={() => append({ kind: 'paren', paren: '(' })}
        >
          (
        </Button>
        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='Fecha parêntese'
          onClick={() => append({ kind: 'paren', paren: ')' })}
        >
          )
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='text-muted-foreground'
          disabled={formula.length === 0}
          onClick={() => onChange(formula.slice(0, -1))}
        >
          Remover último
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='text-muted-foreground hover:text-destructive'
          disabled={formula.length === 0}
          onClick={() => onChange([])}
        >
          Limpar
        </Button>
      </div>
      {formula.length > 0 && !wellFormed ? (
        <FieldError>
          Fórmula incompleta ou inválida. Verifique operadores e parênteses.
        </FieldError>
      ) : null}
    </>
  )
}

/**
 * Editor de fórmula de um campo CALCULADO (F4): candidatos = campos numéricos/
 * moeda/calculados do modelo (exceto o próprio). Reusa o FormulaBuilder.
 */
function FormulaEditor({
  modelId,
  field,
}: {
  modelId: string
  field: FieldDefinition
}) {
  const updateField = useModelsStore((state) => state.updateField)
  const model = useModelsStore((state) =>
    state.models.find((item) => item.id === modelId)
  )
  const candidates = model
    ? Object.values(model.fields)
        .filter(
          (item) =>
            item.id !== field.id &&
            (item.input === 'number' ||
              item.input === 'currency' ||
              item.input === 'calculated')
        )
        .map((item) => ({ id: item.id, label: item.label }))
    : []

  return (
    <Field>
      <FieldLabel>Fórmula</FieldLabel>
      {candidates.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          Crie campos do tipo Número ou Moeda neste modelo para compor o
          cálculo.
        </p>
      ) : (
        <FormulaBuilder
          candidates={candidates}
          formula={field.formula ?? []}
          onChange={(next) => updateField(modelId, field.id, { formula: next })}
        />
      )}
      <FieldDescription>
        Resultado calculado automaticamente a partir de outros campos numéricos.
        Operadores: + − × ÷ e parênteses.
      </FieldDescription>
    </Field>
  )
}

const columnTypeLabels: Record<ItemColumnType, string> = {
  text: 'Texto',
  number: 'Número',
  currency: 'Moeda (R$)',
  calculated: 'Calculada',
}

const columnTypeOrder: ItemColumnType[] = [
  'text',
  'number',
  'currency',
  'calculated',
]

/**
 * Editor das colunas de uma tabela de itens (campo `itemsTable`, F1): nome +
 * tipo por coluna; colunas calculadas têm uma fórmula por linha sobre as outras
 * colunas (reusa o FormulaBuilder). Sem colunas definidas, parte do padrão.
 */
function ColumnsEditor({
  modelId,
  field,
}: {
  modelId: string
  field: FieldDefinition
}) {
  const updateField = useModelsStore((state) => state.updateField)
  const columns = field.columns ?? DEFAULT_ITEM_COLUMNS

  const setColumns = (next: ItemColumnDef[]) =>
    updateField(modelId, field.id, { columns: next })
  const updateColumn = (id: string, patch: Partial<ItemColumnDef>) =>
    setColumns(
      columns.map((col) => (col.id === id ? { ...col, ...patch } : col))
    )
  const removeColumn = (id: string) =>
    setColumns(columns.filter((col) => col.id !== id))
  const addColumn = () =>
    setColumns([
      ...columns,
      {
        id: `col-${crypto.randomUUID().slice(0, 8)}`,
        label: `Coluna ${columns.length + 1}`,
        type: 'text',
      },
    ])

  return (
    <Field>
      <FieldLabel>Colunas da tabela</FieldLabel>
      <div className='flex flex-col gap-3'>
        {columns.map((column) => {
          const candidates = columns
            .filter(
              (col) =>
                col.id !== column.id &&
                (col.type === 'number' ||
                  col.type === 'currency' ||
                  col.type === 'calculated')
            )
            .map((col) => ({ id: col.id, label: col.label }))
          return (
            <div
              key={column.id}
              className='grid gap-3 rounded-xl border border-border/60 bg-muted/20 p-3'
            >
              <div className='grid gap-3 sm:grid-cols-[1fr_12rem_auto] sm:items-end'>
                <Field>
                  <FieldLabel htmlFor={`${column.id}-label`}>
                    Nome da coluna
                  </FieldLabel>
                  <Input
                    id={`${column.id}-label`}
                    value={column.label}
                    onChange={(event) =>
                      updateColumn(column.id, { label: event.target.value })
                    }
                    placeholder='Ex.: Quantidade'
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${column.id}-coltype`}>Tipo</FieldLabel>
                  <Select
                    value={column.type}
                    onValueChange={(value) => {
                      const type = value as ItemColumnType
                      updateColumn(column.id, {
                        type,
                        formula:
                          type === 'calculated'
                            ? (column.formula ?? [])
                            : undefined,
                      })
                    }}
                  >
                    <SelectTrigger id={`${column.id}-coltype`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columnTypeOrder.map((type) => (
                        <SelectItem key={type} value={type}>
                          {columnTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='rounded-xl text-muted-foreground hover:text-destructive'
                  onClick={() => removeColumn(column.id)}
                >
                  <Trash2 aria-hidden='true' className='size-4' />
                  Remover
                </Button>
              </div>
              {column.type === 'calculated' ? (
                candidates.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                    Adicione colunas de número ou moeda para usar no cálculo.
                  </p>
                ) : (
                  <FormulaBuilder
                    candidates={candidates}
                    formula={column.formula ?? []}
                    onChange={(next) =>
                      updateColumn(column.id, { formula: next })
                    }
                  />
                )
              ) : null}
            </div>
          )
        })}
      </div>
      <Button
        type='button'
        variant='outline'
        size='sm'
        className='w-fit rounded-xl'
        onClick={addColumn}
      >
        <Plus aria-hidden='true' className='size-4' />
        Adicionar coluna
      </Button>
      <FieldDescription>
        Defina as colunas da tabela. Colunas calculadas derivam o valor por
        linha (ex.: Total = Quantidade × Preço).
      </FieldDescription>
    </Field>
  )
}

function FieldEditor({
  modelId,
  sectionId,
  field,
}: {
  modelId: string
  sectionId: string
  field: FieldDefinition
}) {
  const updateField = useModelsStore((state) => state.updateField)
  const removeField = useModelsStore((state) => state.removeField)

  return (
    <div className='grid gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4'>
      <div className='grid gap-4 sm:grid-cols-2'>
        <Field>
          <FieldLabel htmlFor={`${field.id}-label`}>Rótulo do campo</FieldLabel>
          <Input
            id={`${field.id}-label`}
            value={field.label}
            onChange={(event) =>
              updateField(modelId, field.id, { label: event.target.value })
            }
            placeholder='Ex.: Objeto'
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${field.id}-type`}>Tipo do campo</FieldLabel>
          <Select
            value={field.input}
            onValueChange={(value) =>
              updateField(modelId, field.id, { input: value as FieldInputType })
            }
          >
            <SelectTrigger id={`${field.id}-type`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {inputTypeOrder.map((type) => (
                <SelectItem key={type} value={type}>
                  {inputTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor={`${field.id}-placeholder`}>
          Texto de exemplo (placeholder)
        </FieldLabel>
        <Input
          id={`${field.id}-placeholder`}
          value={field.placeholder ?? ''}
          onChange={(event) =>
            updateField(modelId, field.id, { placeholder: event.target.value })
          }
          placeholder='Ex.: Descreva o objeto da contratação'
        />
      </Field>

      <Field>
        <FieldLabel htmlFor={`${field.id}-help`}>Texto de ajuda</FieldLabel>
        <Input
          id={`${field.id}-help`}
          value={field.description ?? ''}
          onChange={(event) =>
            updateField(modelId, field.id, { description: event.target.value })
          }
          placeholder='Orientação que aparece abaixo do campo'
        />
        <FieldDescription>
          Agrega valor, não repete o rótulo. Deixe vazio se for óbvio.
        </FieldDescription>
      </Field>

      {field.input === 'select' ? (
        <OptionsEditor modelId={modelId} field={field} />
      ) : null}

      {field.input === 'calculated' ? (
        <FormulaEditor modelId={modelId} field={field} />
      ) : null}

      {field.input === 'itemsTable' ? (
        <ColumnsEditor modelId={modelId} field={field} />
      ) : null}

      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex flex-wrap gap-x-6 gap-y-3'>
          <Field orientation='horizontal' className='w-auto gap-2'>
            <Switch
              id={`${field.id}-required`}
              checked={Boolean(field.required)}
              onCheckedChange={(checked) =>
                updateField(modelId, field.id, { required: checked })
              }
            />
            <FieldLabel
              htmlFor={`${field.id}-required`}
              className='font-normal'
            >
              Obrigatório
            </FieldLabel>
          </Field>
          <Field orientation='horizontal' className='w-auto gap-2'>
            <Switch
              id={`${field.id}-inheritable`}
              checked={Boolean(field.inheritable)}
              onCheckedChange={(checked) =>
                updateField(modelId, field.id, { inheritable: checked })
              }
            />
            <FieldLabel
              htmlFor={`${field.id}-inheritable`}
              className='font-normal'
            >
              Herdável na cadeia
            </FieldLabel>
          </Field>
        </div>
        <Button
          variant='ghost'
          size='sm'
          className='rounded-xl text-muted-foreground hover:text-destructive'
          onClick={() => removeField(modelId, sectionId, field.id)}
        >
          <Trash2 aria-hidden='true' className='size-4' />
          Remover campo
        </Button>
      </div>
    </div>
  )
}

function SectionEditor({
  model,
  section,
}: {
  model: ModelDefinition
  section: SectionDefinition
}) {
  const updateSection = useModelsStore((state) => state.updateSection)
  const removeSection = useModelsStore((state) => state.removeSection)
  const addField = useModelsStore((state) => state.addField)
  const fields = (section.fieldIds ?? [])
    .map((fieldId) => model.fields[fieldId])
    .filter(Boolean)

  return (
    <Card className='rounded-2xl border-0 shadow-border'>
      <CardContent className='grid gap-4 p-5'>
        <div className='grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end'>
          <Field>
            <FieldLabel htmlFor={`${section.id}-title`}>
              Título da seção
            </FieldLabel>
            <Input
              id={`${section.id}-title`}
              value={section.title}
              onChange={(event) =>
                updateSection(model.id, section.id, {
                  title: event.target.value,
                })
              }
              placeholder='Ex.: Identificação'
            />
          </Field>
          <Button
            variant='ghost'
            size='sm'
            className='rounded-xl text-muted-foreground hover:text-destructive'
            onClick={() => removeSection(model.id, section.id)}
          >
            <Trash2 aria-hidden='true' className='size-4' />
            Remover seção
          </Button>
        </div>

        <Field>
          <FieldLabel htmlFor={`${section.id}-desc`}>
            Descrição da seção
          </FieldLabel>
          <Input
            id={`${section.id}-desc`}
            value={section.description}
            onChange={(event) =>
              updateSection(model.id, section.id, {
                description: event.target.value,
              })
            }
            placeholder='Uma linha orientando o preenchimento da seção'
          />
        </Field>

        <Separator />

        {fields.length ? (
          <div className='grid gap-3'>
            {fields.map((field) => (
              <FieldEditor
                key={field.id}
                modelId={model.id}
                sectionId={section.id}
                field={field}
              />
            ))}
          </div>
        ) : (
          <p className='rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground'>
            Nenhum campo nesta seção ainda. Adicione o primeiro abaixo.
          </p>
        )}

        <Button
          variant='outline'
          size='sm'
          className='w-fit rounded-xl'
          onClick={() => addField(model.id, section.id)}
        >
          <Plus aria-hidden='true' className='size-4' />
          Adicionar campo
        </Button>
      </CardContent>
    </Card>
  )
}

export function ModelBuilderPage({ modelId }: { modelId: string }) {
  const model = useModelsStore((state) =>
    state.models.find((item) => item.id === modelId)
  )
  const updateModelMeta = useModelsStore((state) => state.updateModelMeta)
  const addSection = useModelsStore((state) => state.addSection)
  const publishModel = useModelsStore((state) => state.publishModel)
  const unpublishModel = useModelsStore((state) => state.unpublishModel)
  const importInheritableFields = useModelsStore(
    (state) => state.importInheritableFields
  )
  const navigate = useNavigate()
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [confirmUnpublish, setConfirmUnpublish] = useState(false)

  if (!model) {
    return (
      <>
        <Header fixed>
          <HeaderActions />
        </Header>
        <Main className='flex flex-1 flex-col items-center justify-center gap-4 text-center'>
          <p className='text-muted-foreground'>
            Modelo não encontrado. Ele pode ter sido removido.
          </p>
          <Button asChild variant='outline' className='rounded-xl'>
            <Link to='/modelos'>
              <ArrowLeft aria-hidden='true' className='size-4' />
              Voltar para Modelos
            </Link>
          </Button>
        </Main>
      </>
    )
  }

  const parentTypeId = parentOf(model.docType)

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-6 pb-8'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <Button asChild variant='ghost' className='-ml-3 rounded-xl'>
            <Link to='/modelos'>
              <ArrowLeft aria-hidden='true' className='size-4' />
              Voltar para Modelos
            </Link>
          </Button>
          <div className='flex flex-wrap items-center gap-3'>
            <div className='inline-flex items-center rounded-xl border border-border/60 p-0.5'>
              <Button
                type='button'
                variant={mode === 'edit' ? 'secondary' : 'ghost'}
                size='sm'
                className='rounded-lg'
                aria-pressed={mode === 'edit'}
                onClick={() => setMode('edit')}
              >
                <Pencil aria-hidden='true' className='size-4' />
                Editor
              </Button>
              <Button
                type='button'
                variant={mode === 'preview' ? 'secondary' : 'ghost'}
                size='sm'
                className='rounded-lg'
                aria-pressed={mode === 'preview'}
                onClick={() => setMode('preview')}
              >
                <Eye aria-hidden='true' className='size-4' />
                Pré-visualização
              </Button>
            </div>
            {mode === 'edit' ? (
              <span className='inline-flex items-center gap-1.5 text-sm text-muted-foreground'>
                <Check aria-hidden='true' className='size-4 text-primary' />
                Alterações salvas automaticamente
              </span>
            ) : null}
            {model.state === 'published' ? (
              <Button
                variant='outline'
                className='rounded-xl'
                onClick={() => setConfirmUnpublish(true)}
              >
                Despublicar
              </Button>
            ) : (
              <Button
                className='rounded-xl'
                onClick={() => {
                  publishModel(model.id)
                  toast.success('Modelo publicado.')
                }}
              >
                <Send aria-hidden='true' className='size-4' />
                Publicar modelo
              </Button>
            )}
          </div>
        </div>

        {mode === 'preview' ? (
          <ModelPreview model={model} />
        ) : (
          <>
            <Card className='rounded-2xl border-0 shadow-border'>
              <CardContent className='grid gap-4 p-6'>
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge variant='outline' className='font-medium'>
                    {docTypeLabel(model.docType)}
                  </Badge>
                  <Badge variant='outline' className='gap-1'>
                    {model.state === 'published' ? 'Publicado' : 'Rascunho'}
                  </Badge>
                </div>
                <Field>
                  <FieldLabel htmlFor='model-name'>Nome do modelo</FieldLabel>
                  <Input
                    id='model-name'
                    value={model.name}
                    onChange={(event) =>
                      updateModelMeta(model.id, { name: event.target.value })
                    }
                    placeholder='Ex.: DFD de aquisição de bens'
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor='model-intro'>
                    Descrição do modelo
                  </FieldLabel>
                  <Textarea
                    id='model-intro'
                    value={model.intro}
                    onChange={(event) =>
                      updateModelMeta(model.id, { intro: event.target.value })
                    }
                    placeholder='Para que serve este modelo e quando usá-lo'
                  />
                </Field>
              </CardContent>
            </Card>

            {model.sections
              .filter((section) => section.kind === 'fields')
              .map((section) => (
                <SectionEditor
                  key={section.id}
                  model={model}
                  section={section}
                />
              ))}

            <div className='flex flex-wrap gap-2'>
              {parentTypeId ? (
                <Button
                  variant='outline'
                  className='rounded-xl'
                  onClick={() => {
                    const count = importInheritableFields(
                      model.id,
                      parentTypeId
                    )
                    toast.success(
                      count > 0
                        ? `${count} campo(s) herdado(s) de ${docTypeLabel(parentTypeId)}.`
                        : `Nenhum campo novo a herdar de ${docTypeLabel(parentTypeId)}.`
                    )
                  }}
                >
                  <Link2 aria-hidden='true' className='size-4' />
                  Herdar campos de {docTypeLabel(parentTypeId)}
                </Button>
              ) : null}
              <Button
                variant='outline'
                className='rounded-xl'
                onClick={() => addSection(model.id)}
              >
                <Plus aria-hidden='true' className='size-4' />
                Adicionar seção
              </Button>
              <Button
                className='rounded-xl'
                onClick={() => navigate({ to: '/modelos' })}
              >
                <Check aria-hidden='true' className='size-4' />
                Concluir edição
              </Button>
            </div>
          </>
        )}

        <AlertDialog open={confirmUnpublish} onOpenChange={setConfirmUnpublish}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Despublicar este modelo?</AlertDialogTitle>
              <AlertDialogDescription>
                Documentos novos deixam de poder usar este modelo até você
                publicá-lo de novo. Documentos já criados não são afetados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Manter publicado</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  unpublishModel(model.id)
                  toast.success('Modelo despublicado.')
                }}
              >
                Despublicar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Main>
    </>
  )
}
