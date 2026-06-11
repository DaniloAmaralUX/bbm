import { Link } from '@tanstack/react-router'
import { Download, FilePlus2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'

export function TRsPrimaryButtons() {
  return (
    <div className='flex flex-wrap gap-2'>
      <Button asChild className='rounded-xl'>
        <Link to='/novo-tr'>
          <FilePlus2 aria-hidden='true' className='size-4' />
          Novo TR
        </Link>
      </Button>
      <Button
        variant='outline'
        className='rounded-xl'
        onClick={() => toast.success('Exportando listagem…')}
      >
        <Download aria-hidden='true' className='size-4' />
        Exportar lista
      </Button>
    </div>
  )
}
