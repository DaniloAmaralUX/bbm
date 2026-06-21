import { createFileRoute, redirect } from '@tanstack/react-router'

// URL canônica única do app: "/" redireciona para "/dashboard" (mesma tela,
// uma só URL), alinhando com a sidebar e o estado ativo da navegação.
export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' })
  },
})
