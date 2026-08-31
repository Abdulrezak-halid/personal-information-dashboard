import { useQuery } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import { z } from 'zod'
import type { WidgetComponentProps, WidgetDefinition } from '@/dashboard/types'
import { demoAiNews, aiNewsProvider } from '@/providers/news'
import { UpdatedAt, WidgetStatus } from '@/widgets/shared/widget-state'

const schema = z.object({
  itemCount: z.number().int().min(3).max(10),
  refreshMinutes: z.number().int().min(15).max(240),
})
type Settings = z.infer<typeof schema>

function AINewsWidget({ settings, demo }: WidgetComponentProps<Settings>) {
  const query = useQuery({
    queryKey: ['ai-news', settings.itemCount, demo],
    queryFn: () =>
      demo
        ? Promise.resolve(demoAiNews.slice(0, settings.itemCount))
        : aiNewsProvider.getNews().then((items) => items.slice(0, settings.itemCount)),
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
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {query.data?.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg bg-white/3 px-3 py-2 transition hover:bg-white/6"
            >
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-sm font-medium group-hover:text-cyan-300 transition">
                    {item.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-(--muted)">
                    {item.author && <span>{item.author}</span>}
                    {item.publishedAt && (
                      <span>
                        {new Date(item.publishedAt).toLocaleDateString('en', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <ExternalLink
                  size={13}
                  className="mt-0.5 shrink-0 opacity-40 group-hover:opacity-100"
                />
              </div>
            </a>
          ))}
        </div>
        <div className="mt-2">
          <UpdatedAt value={query.dataUpdatedAt} demo={demo} />
        </div>
      </div>
    </WidgetStatus>
  )
}

export const aiNewsWidget: WidgetDefinition<Settings> = {
  type: 'ai-news',
  version: 1,
  name: 'AI News',
  description: 'Recent news and research from AI companies and organizations.',
  category: 'news',
  icon: 'zap',
  component: AINewsWidget,
  defaultSize: { width: 4, height: 4 },
  minSize: { width: 3, height: 3 },
  defaultSettings: {
    itemCount: 5,
    refreshMinutes: 30,
  },
  settingsFields: [
    {
      key: 'itemCount',
      type: 'number',
      label: 'Items to display',
      min: 3,
      max: 10,
    },
    {
      key: 'refreshMinutes',
      type: 'number',
      label: 'Refresh interval (minutes)',
      min: 15,
      max: 240,
    },
  ],
  settingsSchema: schema,
}
