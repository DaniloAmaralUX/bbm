import { Link, useRouterState } from '@tanstack/react-router'
import { docTypeLabel } from '@/features/documents/data/doc-type'
import { useTRWizard } from '@/features/documents/wizard/store/use-tr-wizard'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'

type Crumb = { label: string; href?: string }

function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return []

  const [head, ...rest] = segments

  switch (head) {
    case 'dashboard':
      return [{ label: 'Dashboard' }]

    case 'documentos': {
      const sub = rest[0]
      if (!sub) return [{ label: 'Documentos' }]
      if (sub === 'novo')
        return [
          { label: 'Documentos', href: '/documentos' },
          { label: 'Novo documento' },
        ]
      return [
        { label: 'Documentos', href: '/documentos' },
        { label: `Documento ${sub}` },
      ]
    }

    default:
      return [{ label: head.charAt(0).toUpperCase() + head.slice(1) }]
  }
}

function useWizardStepLabel(active: boolean): string | null {
  // A "etapa" do wizard agora e o tipo de documento corrente da cadeia.
  const docType = useTRWizard((state) => (active ? state.chain.current : null))
  if (!active || !docType) return null
  return docTypeLabel(docType)
}

export function RouteBreadcrumb() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const crumbs = buildCrumbs(pathname)
  const wizardStep = useWizardStepLabel(pathname === '/documentos/novo')

  if (crumbs.length === 0) return null

  const finalCrumbs =
    wizardStep && pathname === '/documentos/novo'
      ? [
          { label: 'Documentos', href: '/documentos' },
          { label: 'Novo documento', href: '/documentos/novo' },
          { label: wizardStep },
        ]
      : crumbs

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {finalCrumbs.map((crumb, index) => {
          const isLast = index === finalCrumbs.length - 1
          return (
            <span
              key={`${crumb.label}-${index}`}
              className='inline-flex items-center gap-1.5 sm:gap-2.5'
            >
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
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
