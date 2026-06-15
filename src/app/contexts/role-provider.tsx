import { createContext, useContext, useState } from 'react'
import { getCookie, setCookie } from '@/shared/lib/cookies'
import { type UserRole, roleLabels } from './role'

const ROLE_COOKIE_NAME = 'app_role'
const ROLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const DEFAULT_ROLE: UserRole = 'requisitante'

function isUserRole(value: string | undefined): value is UserRole {
  return value === 'requisitante' || value === 'sustentacao'
}

type RoleContextType = {
  role: UserRole
  roleLabel: string
  setRole: (role: UserRole) => void
}

const RoleContext = createContext<RoleContextType | null>(null)

type RoleProviderProps = {
  children: React.ReactNode
}

export function RoleProvider({ children }: RoleProviderProps) {
  const [role, _setRole] = useState<UserRole>(() => {
    const saved = getCookie(ROLE_COOKIE_NAME)
    return isUserRole(saved) ? saved : DEFAULT_ROLE
  })

  const setRole = (newRole: UserRole) => {
    _setRole(newRole)
    setCookie(ROLE_COOKIE_NAME, newRole, ROLE_COOKIE_MAX_AGE)
  }

  const contextValue: RoleContextType = {
    role,
    roleLabel: roleLabels[role],
    setRole,
  }

  return <RoleContext value={contextValue}>{children}</RoleContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRole() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}
