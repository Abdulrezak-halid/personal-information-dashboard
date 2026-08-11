import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight } from 'lucide-react'
import { z } from 'zod'
import type { WidgetComponentProps, WidgetDefinition } from '@/dashboard/types'
import { demoQuotes } from '@/providers/coinbase'
import { providerRegistry } from '@/providers/registry'
import { UpdatedAt, WidgetStatus } from '@/widgets/shared/widget-state'

const schema = z.object({
  assets: z.array(z.enum(['BTC', 'ETH', 'SOL', 'ADA'])).min(1),
  quoteCurrency: z.enum(['USD', 'EUR', 'GBP']),
  refreshSeconds: z.number().int().min(30).max(3600),
})
type Settings = z.infer<typeof schema>

function CryptoWidget({ settings, demo }: WidgetComponentProps<Settings>) {
  const query = useQuery({
    queryKey: ['quotes', 'coinbase', settings.assets, settings.quoteCurrency, demo],
    queryFn: () =>
      demo
        ? Promise.resolve(demoQuotes.filter((q) => settings.assets.includes(q.symbol as any)))
        : providerRegistry.market.coinbase.getQuotes(settings.assets, settings.quoteCurrency),
    staleTime: settings.refreshSeconds * 1000,
    refetchInterval: demo ? false : settings.refreshSeconds * 1000,
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
        <div className="space-y-1">
          {query.data?.map((quote) => {
            const change = quote.previousClose
              ? ((quote.price - quote.previousClose) / quote.previousClose) * 100
              : undefined
            return (
              <div
                key={quote.symbol}
                className="flex items-center justify-between rounded-xl bg-white/[0.035] px-3 py-2.5"
              >
                <div>
                  <div className="font-semibold">{quote.symbol}</div>
                  <div className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
                    {quote.quoteCurrency}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg">
                    {new Intl.NumberFormat('en', {
                      style: 'currency',
                      currency: quote.quoteCurrency,
                      maximumFractionDigits: quote.price > 100 ? 0 : 2,
                    }).format(quote.price)}
                  </div>
                  {change !== undefined && (
                    <div className="flex items-center justify-end gap-0.5 text-xs text-emerald-300">
                      <ArrowUpRight size={12} />
                      {change.toFixed(2)}%
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-auto">
          <UpdatedAt value={query.dataUpdatedAt} demo={demo} />
        </div>
      </div>
    </WidgetStatus>
  )
}

export const cryptoWidget: WidgetDefinition<Settings> = {
  type: 'crypto',
  version: 1,
  name: 'Crypto',
  description: 'Public spot prices for selected digital assets.',
  category: 'finance',
  icon: 'bitcoin',
  component: CryptoWidget,
  defaultSize: { width: 4, height: 3 },
  minSize: { width: 3, height: 2 },
  defaultSettings: { assets: ['BTC', 'ETH'], quoteCurrency: 'USD', refreshSeconds: 60 },
  settingsFields: [
    {
      key: 'assets',
      type: 'multiselect',
      label: 'Assets',
      options: ['BTC', 'ETH', 'SOL', 'ADA'].map((value) => ({ value, label: value })),
    },
    {
      key: 'quoteCurrency',
      type: 'select',
      label: 'Quote currency',
      options: ['USD', 'EUR', 'GBP'].map((value) => ({ value, label: value })),
    },
    {
      key: 'refreshSeconds',
      type: 'number',
      label: 'Refresh interval (seconds)',
      min: 30,
      max: 3600,
    },
  ],
  settingsSchema: schema,
}
