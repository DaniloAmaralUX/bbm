import { Link, useRouterState } from '@tanstack/react-router'
import { getTemplateDefinition } from '@/features/tr/data/templates'
import { useTRWizard } from '@/features/tr/wizard/store/use-tr-wizard'
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

    case 'trs':
      return [{ label: 'TRs' }]

    case 'novo-tr':
      return [{ label: 'TRs', href: '/trs' }, { label: 'Novo TR' }]

    case 'tr': {
      const trId = rest[0]
      return [
        { label: 'TRs', href: '/trs' },
        { label: trId ? `TR ${trId}` : 'TR' },
      ]
    }

    default:
      return [{ label: head.charAt(0).toUpperCase() + head.slice(1) }]
  }
}

function useWizardStepLabel(active: boolean): string | null {
  const currentStep = useTRWizard((state) => (active ? state.currentStep : 0))
  const institution = useTRWizard((state) =>
    active ? state.context.institution : null
  )
  const templateType = useTRWizard((state) =>
    active ? state.context.templateType : null
  )

  if (!active || !institution || !templateType) return null
  if (currentStep === 0) return 'Configuração do Modelo'

  const template = getTemplateDefinition(institution, templateType)
  return template.sections[currentStep - 1]?.title ?? null
}

export function RouteBreadcrumb() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const crumbs = buildCrumbs(pathname)
  const wizardStep = useWizardStepLabel(pathname === '/novo-tr')

  if (crumbs.length === 0) return null

  const finalCrumbs =
    wizardStep && pathname === '/novo-tr'
      ? [
          { label: 'TRs', href: '/trs' },
          { label: 'Novo TR', href: '/novo-tr' },
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
