import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
import { z } from 'zod'
import type { WidgetComponentProps, WidgetDefinition } from '@/dashboard/types'
import { UpdatedAt } from '@/widgets/shared/widget-state'

const schema = z.object({
  label: z.string().min(1).max(60),
  style: z.enum(['area', 'line']),
  refreshSeconds: z.number().int().min(10).max(3600),
})
type Settings = z.infer<typeof schema>
const data = [42, 48, 45, 57, 53, 68, 64, 72, 69, 78, 82, 79].map((value, index) => ({
  index,
  value,
}))

function MockMetricsWidget({ settings }: WidgetComponentProps<Settings>) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm text-(--muted)">{settings.label}</div>
          <div className="mt-1 font-mono text-3xl">
            79.4<span className="ml-1 text-sm text-cyan-300">%</span>
          </div>
        </div>
        <div className="text-xs text-emerald-300">+12.8%</div>
      </div>
      <div className="mt-3 min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="metric-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={[35, 90]} />
            <Tooltip
              contentStyle={{ background: '#111720', border: '1px solid #273141', borderRadius: 8 }}
              labelFormatter={() => ''}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#22d3ee"
              fill={settings.style === 'area' ? 'url(#metric-fill)' : 'transparent'}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <UpdatedAt value="2026-08-11T09:30:00.000Z" demo />
    </div>
  )
}

export const mockMetricsWidget: WidgetDefinition<Settings> = {
  type: 'mock-metrics',
  version: 1,
  name: 'Mock Metrics',
  description: 'A deterministic chart for layouts and demos.',
  category: 'developer',
  icon: 'chart',
  component: MockMetricsWidget,
  defaultSize: { width: 4, height: 4 },
  minSize: { width: 3, height: 3 },
  defaultSettings: { label: 'System efficiency', style: 'area', refreshSeconds: 30 },
  settingsFields: [
    { key: 'label', type: 'text', label: 'Metric label' },
    {
      key: 'style',
      type: 'select',
      label: 'Chart style',
      options: [
        { value: 'area', label: 'Area' },
        { value: 'line', label: 'Line' },
      ],
    },
    { key: 'refreshSeconds', type: 'number', label: 'Mock refresh interval', min: 10, max: 3600 },
  ],
  settingsSchema: schema,
}
