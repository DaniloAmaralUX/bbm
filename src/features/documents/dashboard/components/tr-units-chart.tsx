import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/ui/chart'

type UnitsChartItem = {
  unit: string
  records: number
}

type TRUnitsChartProps = {
  data: UnitsChartItem[]
}

const chartConfig: ChartConfig = {
  records: {
    label: 'Documentos',
    color: 'var(--primary)',
  },
}

export function TRUnitsChart({ data }: TRUnitsChartProps) {
  const total = data.reduce((sum, item) => sum + item.records, 0)
  const summary = data.map((item) => `${item.unit}: ${item.records}`).join(', ')

  return (
    <div
      role='img'
      aria-label={`Distribuição de documentos por unidade. Total: ${total}. ${summary}.`}
    >
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
          />
          <YAxis
            type='category'
            dataKey='unit'
            stroke='var(--muted-foreground)'
            fontSize={12}
            width={88}
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
          <caption>Distribuição de documentos por unidade</caption>
          <thead>
            <tr>
              <th scope='col'>Unidade</th>
              <th scope='col'>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.unit}>
                <td>{item.unit}</td>
                <td>{item.records}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
