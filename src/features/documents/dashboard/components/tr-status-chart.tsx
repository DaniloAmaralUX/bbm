import { Cell, Label, Pie, PieChart } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/ui/chart'

type StatusChartItem = {
  label: string
  value: number
  color: string
}

type TRStatusChartProps = {
  data: StatusChartItem[]
}

function slug(label: string) {
  return label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function TRStatusChart({ data }: TRStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const summary = data
    .map((item) => `${item.label}: ${item.value}`)
    .join(', ')

  const keyed = data.map((item) => ({ ...item, key: slug(item.label) }))

  const chartConfig: ChartConfig = keyed.reduce<ChartConfig>((acc, item) => {
    acc[item.key] = { label: item.label, color: item.color }
    return acc
  }, {})

  return (
    <div
      role='img'
      aria-label={`Distribuição de documentos por status. Total: ${total}. ${summary}.`}
    >
      <ChartContainer config={chartConfig} className='h-[320px] w-full'>
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, _name, item) => {
                  const cfg = chartConfig[item.payload?.key as string]
                  return (
                    <>
                      <span
                        className='inline-block size-2.5 shrink-0 rounded-[2px]'
                        style={{ backgroundColor: cfg?.color as string }}
                      />
                      <span className='text-muted-foreground'>
                        {cfg?.label}
                      </span>
                      <span className='ms-auto font-medium tabular-nums text-foreground'>
                        {value} TRs
                      </span>
                    </>
                  )
                }}
              />
            }
          />
          <Pie
            data={keyed}
            dataKey='value'
            nameKey='key'
            innerRadius={76}
            outerRadius={110}
            paddingAngle={3}
            stroke='transparent'
          >
            {keyed.map((entry) => (
              <Cell key={entry.key} fill={entry.color} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (
                  !viewBox ||
                  !('cx' in viewBox) ||
                  !('cy' in viewBox)
                ) {
                  return null
                }
                const cx = viewBox.cx ?? 0
                const cy = viewBox.cy ?? 0
                return (
                  <g>
                    <text
                      x={cx}
                      y={cy - 6}
                      textAnchor='middle'
                      dominantBaseline='central'
                      className='fill-foreground text-3xl font-semibold tabular-nums'
                    >
                      {total}
                    </text>
                    <text
                      x={cx}
                      y={cy + 18}
                      textAnchor='middle'
                      dominantBaseline='central'
                      className='fill-muted-foreground text-[10px] font-semibold uppercase tracking-[0.14em]'
                    >
                      TRs ativos
                    </text>
                  </g>
                )
              }}
            />
          </Pie>
          <ChartLegend
            verticalAlign='bottom'
            content={<ChartLegendContent nameKey='key' />}
          />
        </PieChart>
      </ChartContainer>
      <div className='sr-only'>
        <table>
          <caption>Distribuição de documentos por status</caption>
          <thead>
            <tr>
              <th scope='col'>Status</th>
              <th scope='col'>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.label}>
                <td>{item.label}</td>
                <td>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
