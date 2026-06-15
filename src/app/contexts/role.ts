/**
 * Papel do usuário como contexto de UI (sem login). No v0 o papel alterna o menu
 * e as permissões de rota; ver `role-provider.tsx` (estado) e `role-guard.tsx`.
 * - `requisitante`: gera os documentos da cadeia (com herança e IA).
 * - `sustentacao`: cria, edita e publica os modelos.
 */
export type UserRole = 'requisitante' | 'sustentacao'

export const roleLabels: Record<UserRole, string> = {
  requisitante: 'Requisitante',
  sustentacao: 'Sustentação',
}

/** Papéis na ordem de exibição no seletor. */
export const userRoles: readonly UserRole[] = ['requisitante', 'sustentacao']

/** Rota inicial de cada papel (destino de redirecionamento das guardas). */
export const roleHome: Record<UserRole, '/dashboard' | '/modelos'> = {
  requisitante: '/dashboard',
  sustentacao: '/modelos',
}
