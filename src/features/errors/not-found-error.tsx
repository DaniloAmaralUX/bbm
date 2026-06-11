import { Link } from '@tanstack/react-router'
import { SearchX } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function NotFoundError() {
  return (
    <div className='flex min-h-svh items-center justify-center bg-background px-4 py-12'>
      <Card className='w-full max-w-lg rounded-3xl'>
        <CardHeader className='space-y-4 text-center'>
          <div className='mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <SearchX className='size-6' />
          </div>
          <CardTitle>Página não encontrada</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <p className='text-sm text-muted-foreground'>
            A rota solicitada não existe.
          </p>
          <Button asChild className='rounded-xl'>
            <Link to='/dashboard'>Ir para o Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
