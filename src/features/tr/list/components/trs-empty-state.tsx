import { Link } from '@tanstack/react-router'
import { FileSearch, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'

type TRsEmptyStateProps = {
  filtered?: boolean
  onClearFilters?: () => void
}

export function TRsEmptyState({
  filtered = false,
  onClearFilters,
}: TRsEmptyStateProps) {
  return (
    <Empty className='rounded-2xl border border-dashed'>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <FileSearch className='size-6' />
        </EmptyMedia>
        <EmptyTitle>
          {filtered ? 'Nenhum TR encontrado' : 'Nenhum TR cadastrado'}
        </EmptyTitle>
        <EmptyDescription>
          {filtered
            ? 'Ajuste os filtros ou a busca para encontrar um documento existente.'
            : 'Comece criando o primeiro Termo de Referência para testar o fluxo do produto.'}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {filtered && onClearFilters ? (
          <Button
            variant='outline'
            className='rounded-xl'
            onClick={onClearFilters}
          >
            Limpar filtros
          </Button>
        ) : !filtered ? (
          <Button asChild className='rounded-xl'>
            <Link to='/novo-tr'>
              <Plus className='size-4' />
              Criar novo TR
            </Link>
          </Button>
        ) : null}
      </EmptyContent>
    </Empty>
  )
}
