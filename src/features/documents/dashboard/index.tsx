import { Link } from '@tanstack/react-router'
import { FilePlus2, FolderOpen } from 'lucide-react'
import { Header } from '@/shared/layout/header'
import { HeaderActions } from '@/shared/layout/header-actions'
import { Main } from '@/shared/layout/main'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/shared/ui/card'
import { SectionLabel } from '@/shared/components/section-label'
import {
  recentTrs,
  trChainFunnel,
  trDocTypeData,
  trKpis,
  trStatusData,
  trUnitData,
} from '../data/app'
import { CategoryBarChart } from './components/category-bar-chart'
import { TRChainHero } from './components/tr-chain-hero'
import { TRKpiCards } from './components/tr-kpi-cards'
import { TRRecentList } from './components/tr-recent-list'
import { TRStatusChart } from './components/tr-status-chart'

export function TRDashboard() {
  return (
    <>
      <Header>
        <HeaderActions />
      </Header>

      <Main className='space-y-6 pb-8'>
        <section className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-semibold tracking-tight'>Dashboard</h1>
            <p className='max-w-2xl text-sm text-muted-foreground'>
              Acompanhe o status dos documentos e conduza o fluxo de elaboração
              com mais padronização e menos retrabalho.
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button asChild className='rounded-xl'>
              <Link to='/documentos/novo'>
                <FilePlus2 aria-hidden='true' className='size-4' />
                Novo documento
              </Link>
            </Button>
            <Button asChild variant='outline' className='rounded-xl'>
              <Link to='/documentos'>
                <FolderOpen aria-hidden='true' className='size-4' />
                Ver documentos
              </Link>
            </Button>
          </div>
        </section>

        <TRChainHero funnel={trChainFunnel} />

        <TRKpiCards items={trKpis.map((item) => ({ ...item }))} />

        <section className='grid gap-4 xl:grid-cols-6'>
          <Card className='rounded-2xl border-0 shadow-border xl:col-span-2'>
            <CardHeader className='space-y-2'>
              <SectionLabel>Status dos documentos</SectionLabel>
              <CardDescription className='text-pretty'>
                Distribuição entre elaboração e conclusão.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TRStatusChart data={trStatusData.map((item) => ({ ...item }))} />
            </CardContent>
          </Card>

          <Card className='rounded-2xl border-0 shadow-border xl:col-span-2'>
            <CardHeader className='space-y-2'>
              <SectionLabel>Documentos por tipo</SectionLabel>
              <CardDescription className='text-pretty'>
                Volume por tipo de documento da cadeia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryBarChart
                data={trDocTypeData.map((item) => ({
                  label: item.label,
                  records: item.records,
                }))}
                noun='Tipo'
                caption='Distribuição de documentos por tipo'
                yAxisWidth={48}
              />
            </CardContent>
          </Card>

          <Card className='rounded-2xl border-0 shadow-border xl:col-span-2'>
            <CardHeader className='space-y-2'>
              <SectionLabel>Documentos por unidade</SectionLabel>
              <CardDescription className='text-pretty'>
                Volume de documentos em andamento por unidade.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryBarChart
                data={trUnitData.map((item) => ({
                  label: item.unit,
                  records: item.records,
                }))}
                noun='Unidade'
                caption='Distribuição de documentos por unidade'
              />
            </CardContent>
          </Card>
        </section>

        <Card className='rounded-2xl border-0 shadow-border'>
          <CardHeader className='space-y-2'>
            <SectionLabel>Documentos recentes</SectionLabel>
            <CardDescription className='text-pretty'>
              Últimos documentos atualizados pelas áreas.
            </CardDescription>
          </CardHeader>
          <CardContent className='px-3'>
            <TRRecentList items={recentTrs.map((item) => ({ ...item }))} />
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
