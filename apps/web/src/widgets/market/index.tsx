import { useQuery } from '@tanstack/react-query'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { z } from 'zod'
import type { WidgetComponentProps, WidgetDefinition } from '@/dashboard/types'
import { demoStockQuotes, stockProvider } from '@/providers/stocks'
import { UpdatedAt, WidgetStatus } from '@/widgets/shared/widget-state'

const schema = z.object({
  symbols: z.array(z.string().min(1).max(6)).min(1).max(10),
  refreshMinutes: z.number().int().min(15).max(120),
})
type Settings = z.infer<typeof schema>

function MarketWidget({ settings, demo }: WidgetComponentProps<Settings>) {
  const query = useQuery({
    queryKey: ['stocks', settings.symbols, demo],
    queryFn: () =>
      demo
        ? Promise.resolve(demoStockQuotes.filter((q) => settings.symbols.includes(q.symbol)))
        : stockProvider.getQuotes(settings.symbols),
    staleTime: settings.refreshMinutes * 60_000,
    refetchInterval: demo ? false : settings.refreshMinutes * 60_000,
    refetchIntervalInBackground: false,
    retry: 1,
  })

  return (
    <WidgetStatus
      loading={query.isPending}
      error={query.error}
      empty={!query.data?.length}
      onRefresh={() => void query.refetch()}
    >
      <div className="flex h-full flex-col">
        <div className="space-y-1.5">
          {query.data?.map((quote) => {
            const isPositive = (quote.change ?? 0) >= 0
            return (
              <div
                key={quote.symbol}
                className="flex items-center justify-between rounded-lg bg-white/[0.035] px-3 py-2"
              >
                <div>
                  <div className="font-semibold text-sm">{quote.symbol}</div>
                  <div className="text-[10px] text-(--muted)">{quote.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-base">
                    ${quote.price.toFixed(quote.price > 100 ? 2 : 2)}
                  </div>
                  {quote.change !== undefined && (
                    <div
                      className={`flex items-center justify-end gap-0.5 text-xs ${
                        isPositive ? 'text-emerald-300' : 'text-red-300'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(quote.change).toFixed(2)} (
                      {Math.abs(quote.changePercent ?? 0).toFixed(2)}%)
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        {query.data?.[0]?.delayed && (
          <div className="mt-2 text-[10px] text-amber-400">Market data delayed</div>
        )}
        <div className="mt-auto">
          <UpdatedAt value={query.dataUpdatedAt} demo={demo} />
        </div>
      </div>
    </WidgetStatus>
  )
}

export const marketWidget: WidgetDefinition<Settings> = {
  type: 'market',
  version: 1,
  name: 'Market',
  description: 'Stock prices and daily changes for major companies.',
  category: 'finance',
  icon: 'trending-up',
  component: MarketWidget,
  defaultSize: { width: 4, height: 4 },
  minSize: { width: 3, height: 3 },
  defaultSettings: {
    symbols: ['AAPL', 'MSFT', 'NVDA'],
    refreshMinutes: 30,
  },
  settingsFields: [
    {
      key: 'symbols',
      type: 'multiselect',
      label: 'Stock symbols',
      options: ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'TSLA', 'META', 'NFLX'].map((value) => ({
        value,
        label: value,
      })),
    },
    {
      key: 'refreshMinutes',
      type: 'number',
      label: 'Refresh interval (minutes)',
      min: 15,
      max: 120,
      help: 'Note: Real stock data requires API configuration',
    },
  ],
  settingsSchema: schema,
}
