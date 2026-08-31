import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import type { WidgetComponentProps, WidgetDefinition } from '@/dashboard/types'
import { demoExchangeRates, exchangeRateProvider } from '@/providers/exchange-rates'
import { UpdatedAt, WidgetStatus } from '@/widgets/shared/widget-state'

const schema = z.object({
  baseCurrency: z.enum(['USD', 'EUR', 'GBP']),
  targetCurrencies: z.array(z.string()).min(1),
  refreshMinutes: z.number().int().min(10).max(360),
})
type Settings = z.infer<typeof schema>

function CurrencyWidget({ settings, demo }: WidgetComponentProps<Settings>) {
  const query = useQuery({
    queryKey: ['exchange-rates', settings.baseCurrency, settings.targetCurrencies, demo],
    queryFn: () =>
      demo
        ? Promise.resolve(
            demoExchangeRates.filter((r) => settings.targetCurrencies.includes(r.quoteCurrency)),
          )
        : exchangeRateProvider.getRates(settings.baseCurrency, settings.targetCurrencies),
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
        <div className="space-y-2">
          {query.data?.map((rate) => {
            const formatted = new Intl.NumberFormat('en', {
              minimumFractionDigits: rate.rate > 1 ? 2 : 4,
              maximumFractionDigits: rate.rate > 1 ? 2 : 6,
            }).format(rate.rate)

            return (
              <div
                key={rate.quoteCurrency}
                className="flex items-center justify-between rounded-lg bg-white/[0.035] px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium">{rate.quoteCurrency}</div>
                  <div className="text-[10px] text-(--muted)">
                    {rate.baseCurrency} → {rate.quoteCurrency}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg">{formatted}</div>
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

export const currencyWidget: WidgetDefinition<Settings> = {
  type: 'currency',
  version: 1,
  name: 'Currency',
  description: 'Exchange rates for selected currencies.',
  category: 'finance',
  icon: 'globe',
  component: CurrencyWidget,
  defaultSize: { width: 4, height: 3 },
  minSize: { width: 3, height: 2 },
  defaultSettings: {
    baseCurrency: 'USD',
    targetCurrencies: ['EUR', 'TRY', 'GBP'],
    refreshMinutes: 60,
  },
  settingsFields: [
    {
      key: 'baseCurrency',
      type: 'select',
      label: 'Base currency',
      options: ['USD', 'EUR', 'GBP'].map((value) => ({ value, label: value })),
    },
    {
      key: 'targetCurrencies',
      type: 'multiselect',
      label: 'Target currencies',
      options: ['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'TRY', 'BRL', 'ZAR'].map(
        (value) => ({ value, label: value }),
      ),
    },
    {
      key: 'refreshMinutes',
      type: 'number',
      label: 'Refresh interval (minutes)',
      min: 10,
      max: 360,
    },
  ],
  settingsSchema: schema,
}
