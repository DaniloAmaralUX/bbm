import { Link, useRouterState } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { type DocType, docTypeLabel } from '@/features/documents/data/doc-type'
import { type ModelDefinition } from '@/features/documents/data/templates'
import { trs } from '@/features/documents/data/trs'
import { useTRWizard } from '@/features/documents/wizard/store/use-tr-wizard'
import { useModelsStore } from '@/features/models/store/use-models-store'

type Crumb = { label: string; href?: string }

type Resolvers = {
  models: ModelDefinition[]
  wizardDocType: DocType | null
}

// Resolve os crumbs com NOMES reais (título do documento, nome do modelo) em vez
// de ids genéricos — saber onde se está reduz re-busca (wayfinding = findability).
function buildCrumbs(pathname: string, ctx: Resolvers): Crumb[] {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return []

  const [head, sub] = segments

  switch (head) {
    case 'dashboard':
      return [{ label: 'Dashboard' }]

    case 'documentos': {
      if (!sub) return [{ label: 'Documentos' }]
      if (sub === 'novo') {
        const base: Crumb[] = [
          { label: 'Documentos', href: '/documentos' },
          { label: 'Novo documento', href: '/documentos/novo' },
        ]
        return ctx.wizardDocType
          ? [...base, { label: docTypeLabel(ctx.wizardDocType) }]
          : [
              { label: 'Documentos', href: '/documentos' },
              { label: 'Novo documento' },
            ]
      }
      const doc = trs.find((item) => item.id === sub)
      return [
        { label: 'Documentos', href: '/documentos' },
        { label: doc?.title ?? `Documento ${sub}` },
      ]
    }

    case 'modelos': {
      if (!sub) return [{ label: 'Modelos' }]
      const model = ctx.models.find((item) => item.id === sub)
      return [
        { label: 'Modelos', href: '/modelos' },
        { label: model?.name ?? 'Modelo' },
      ]
    }

    case 'tipos':
      return [{ label: 'Tipos de documento' }]

    default:
      return [{ label: head.charAt(0).toUpperCase() + head.slice(1) }]
  }
}

export function RouteBreadcrumb() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const models = useModelsStore((s) => s.models)
  // Etapa corrente do wizard (tipo de documento da cadeia) para o crumb final.
  const wizardDocType = useTRWizard((s) =>
    pathname === '/documentos/novo' ? s.chain.current : null
  )

  const crumbs = buildCrumbs(pathname, { models, wizardDocType })
  if (crumbs.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <span
              key={`${crumb.label}-${index}`}
              className='inline-flex items-center gap-1.5 sm:gap-2.5'
            >
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className='max-w-[40ch] truncate'>
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator /> : null}
            </span>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
