import { useEffect, useRef } from 'react'
import { Navigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { type UserRole, roleHome } from '@/app/contexts/role'
import { useRole } from '@/app/contexts/role-provider'

type RoleGuardProps = {
  /** Papel exigido pela rota. */
  allow: UserRole
  children: React.ReactNode
}

/**
 * Guarda de rota por papel (permissões de UI, sem login). Se o papel atual não
 * for `allow`, avisa e redireciona para a rota inicial do papel. Como lê do
 * contexto, reage à troca de papel ao vivo (se o usuário muda de papel estando
 * numa rota que deixa de ser permitida, é redirecionado na hora).
 */
export function RoleGuard({ allow, children }: RoleGuardProps) {
  const { role } = useRole()
  if (role !== allow) {
    return <RoleRedirect allow={allow} role={role} />
  }
  return <>{children}</>
}

function RoleRedirect({ allow, role }: { allow: UserRole; role: UserRole }) {
  const notified = useRef(false)
  useEffect(() => {
    if (notified.current) return
    notified.current = true
    toast.error(blockedMessage(allow))
  }, [allow])

  return <Navigate to={roleHome[role]} replace />
}

function blockedMessage(allow: UserRole): string {
  return allow === 'sustentacao'
    ? 'Esta área é exclusiva do perfil Sustentação.'
    : 'Criar documento é do perfil Requisitante.'
}
