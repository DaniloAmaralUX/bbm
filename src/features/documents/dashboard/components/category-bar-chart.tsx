import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/ui/chart'

export type CategoryDatum = { label: string; records: number }

type CategoryBarChartProps = {
  data: CategoryDatum[]
  /** Substantivo da categoria, para a legenda acessível (ex.: "unidade", "tipo"). */
  noun: string
  caption: string
  /** Largura do eixo de rótulos; rótulos curtos (siglas) pedem menos. */
  yAxisWidth?: number
}

const chartConfig: ChartConfig = {
  records: {
    label: 'Documentos',
    color: 'var(--primary)',
  },
}

/**
 * Barra horizontal genérica de "documentos por categoria". Reaproveitada para a
 * distribuição por unidade e por tipo de documento, evitando componentes avulsos
 * duplicados. Cor por token (--primary); inclui tabela sr-only para leitores.
 */
export function CategoryBarChart({
  data,
  noun,
  caption,
  yAxisWidth = 88,
}: CategoryBarChartProps) {
  const total = data.reduce((sum, item) => sum + item.records, 0)
  const summary = data
    .map((item) => `${item.label}: ${item.records}`)
    .join(', ')

  return (
    <div role='img' aria-label={`${caption}. Total: ${total}. ${summary}.`}>
      <ChartContainer config={chartConfig} className='h-[320px] w-full'>
        <BarChart
          data={data}
          layout='vertical'
          margin={{ top: 8, right: 32, left: 12, bottom: 8 }}
        >
          <XAxis
            type='number'
            stroke='var(--muted-foreground)'
            fontSize={12}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type='category'
            dataKey='label'
            stroke='var(--muted-foreground)'
            fontSize={12}
            width={yAxisWidth}
            axisLine={false}
            tickLine={false}
          />
          <ChartTooltip
            cursor={{ fill: 'var(--muted)' }}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value) => `${value ?? 0} documentos`}
              />
            }
          />
          <Bar
            dataKey='records'
            radius={[0, 8, 8, 0]}
            fill='var(--primary)'
            fillOpacity={0.85}
          >
            <LabelList
              dataKey='records'
              position='right'
              offset={8}
              className='fill-foreground text-xs font-medium tabular-nums'
            />
          </Bar>
        </BarChart>
      </ChartContainer>
      <div className='sr-only'>
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              <th scope='col'>{noun}</th>
              <th scope='col'>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.label}>
                <td>{item.label}</td>
                <td>{item.records}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
