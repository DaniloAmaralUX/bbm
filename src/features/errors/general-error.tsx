import { Link } from '@tanstack/react-router'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function GeneralError() {
  return (
    <div className='flex min-h-svh items-center justify-center bg-background px-4 py-12'>
      <Card className='w-full max-w-lg rounded-3xl'>
        <CardHeader className='space-y-4 text-center'>
          <div className='mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive'>
            <AlertTriangle className='size-6' />
          </div>
          <CardTitle>Algo deu errado</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <p className='text-sm text-muted-foreground'>
            Ocorreu um erro inesperado ao carregar a aplicação. Tente voltar ao
            dashboard para continuar o trabalho.
          </p>
          <Button asChild className='rounded-xl'>
            <Link to='/dashboard'>Voltar ao Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
