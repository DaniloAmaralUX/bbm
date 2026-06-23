import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { NewDocumentMenu } from '@/features/documents/components/new-document-menu'

export function TRsPrimaryButtons() {
  return (
    <div className='flex flex-wrap gap-2'>
      <NewDocumentMenu />
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
