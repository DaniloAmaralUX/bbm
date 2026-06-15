import { Header } from '@/shared/layout/header'
import { HeaderActions } from '@/shared/layout/header-actions'
import { Main } from '@/shared/layout/main'
import { trs } from '@/features/documents/data/trs'
import { TRsPrimaryButtons } from './components/trs-primary-buttons'
import { TRsTable } from './components/trs-table'

export function TRListPage() {
  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 stagger-fade-in flex-col gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-semibold tracking-tight text-balance'>
              Documentos
            </h1>
            <p className='max-w-2xl text-sm text-muted-foreground'>
              Gerencie documentos em rascunho e aprovação com filtros rápidos.
            </p>
          </div>
          <TRsPrimaryButtons />
        </div>
        <TRsTable data={trs} />
      </Main>
    </>
  )
}
