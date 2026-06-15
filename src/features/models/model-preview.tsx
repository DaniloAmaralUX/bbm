import { Link2 } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
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
import { Textarea } from '@/shared/ui/textarea'
import {
  type FieldDefinition,
  type ModelDefinition,
} from '@/features/documents/data/templates'

/** Controle desabilitado que espelha como o campo apareceria no documento. */
function PreviewControl({ field }: { field: FieldDefinition }) {
  if (field.input === 'textarea') {
    return (
      <Textarea
        disabled
        placeholder={field.placeholder ?? 'Texto longo'}
        className='min-h-24'
      />
    )
  }
  if (field.input === 'select') {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue
            placeholder={field.placeholder ?? 'Selecione uma opção'}
          />
        </SelectTrigger>
        <SelectContent>
          {(field.options ?? []).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
  return (
    <Input
      disabled
      type={field.input}
      placeholder={field.placeholder ?? 'Texto curto'}
    />
  )
}

function PreviewField({ field }: { field: FieldDefinition }) {
  return (
    <Field>
      <FieldLabel className='text-sm font-medium'>
        {field.label}
        {field.required ? (
          <>
            <span aria-hidden='true' className='ms-0.5 text-destructive'>
              *
            </span>
            <span className='sr-only'> (obrigatório)</span>
          </>
        ) : null}
        {field.inheritable ? (
          <Badge
            variant='outline'
            className='gap-1 rounded-full border-primary/20 bg-secondary px-2 py-0 text-[11px] font-semibold text-secondary-foreground'
          >
            <Link2 aria-hidden='true' className='size-3' />
            Herdável
          </Badge>
        ) : null}
      </FieldLabel>
      <PreviewControl field={field} />
      {field.description ? (
        <FieldDescription className='text-xs'>
          {field.description}
        </FieldDescription>
      ) : null}
    </Field>
  )
}

/**
 * Pré-visualização (RF-04): renderiza o modelo como o formulário do documento
 * final apareceria, somente-leitura. Campos herdáveis aparecem marcados.
 */
export function ModelPreview({ model }: { model: ModelDefinition }) {
  const fieldSections = model.sections.filter(
    (section) => section.kind === 'fields'
  )

  return (
    <div className='grid gap-6'>
      {model.intro ? (
        <p className='max-w-2xl text-sm text-muted-foreground'>{model.intro}</p>
      ) : null}

      {fieldSections.length === 0 ? (
        <p className='rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground'>
          Este modelo ainda não tem seções com campos. Adicione no editor para
          ver a prévia do documento.
        </p>
      ) : (
        fieldSections.map((section) => {
          const fields = (section.fieldIds ?? [])
            .map((fieldId) => model.fields[fieldId])
            .filter(Boolean)
          return (
            <Card
              key={section.id}
              className='rounded-2xl border-0 shadow-border'
            >
              <CardContent className='grid gap-4 p-6'>
                <div className='space-y-1'>
                  <h2 className='text-lg font-semibold text-balance'>
                    {section.title}
                  </h2>
                  {section.description ? (
                    <p className='text-sm text-muted-foreground'>
                      {section.description}
                    </p>
                  ) : null}
                </div>
                {fields.length ? (
                  <FieldGroup className='gap-5'>
                    {fields.map((field) => (
                      <PreviewField key={field.id} field={field} />
                    ))}
                  </FieldGroup>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    Seção sem campos.
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
