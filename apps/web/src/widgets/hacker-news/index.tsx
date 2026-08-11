import { useQuery } from '@tanstack/react-query'
import { ExternalLink, MessageCircle } from 'lucide-react'
import { z } from 'zod'
import type { WidgetComponentProps, WidgetDefinition } from '@/dashboard/types'
import { demoFeed } from '@/providers/feeds'
import { providerRegistry } from '@/providers/registry'
import { UpdatedAt, WidgetStatus } from '@/widgets/shared/widget-state'

const schema = z.object({
  feed: z.enum(['top', 'new', 'best']),
  articleCount: z.number().int().min(3).max(20),
  refreshMinutes: z.number().int().min(5).max(120),
})
type Settings = z.infer<typeof schema>

function HackerNewsWidget({ settings, demo }: WidgetComponentProps<Settings>) {
  const query = useQuery({
    queryKey: ['feed', 'hacker-news', settings.feed, settings.articleCount, demo],
    queryFn: () =>
      demo
        ? Promise.resolve(demoFeed.slice(0, settings.articleCount))
        : providerRegistry.feed['hacker-news'].getItems({
            feed: settings.feed,
            limit: settings.articleCount,
          }),
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
        <div className="min-h-0 flex-1 space-y-1 overflow-auto pr-1">
          {query.data?.map((item, index) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="group flex gap-3 rounded-lg px-2 py-2 hover:bg-white/5"
            >
              <span className="w-5 shrink-0 font-mono text-xs text-cyan-400/60">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm leading-snug group-hover:text-cyan-200">
                  {item.title}
                </span>
                <span className="mt-1 flex items-center gap-2 text-[10px] text-(--muted)">
                  {item.author && <span>{item.author}</span>}
                  {item.score !== undefined && (
                    <span className="flex items-center gap-1">
                      <MessageCircle size={10} />
                      {item.score}
                    </span>
                  )}
                </span>
              </span>
              <ExternalLink
                size={13}
                className="mt-0.5 shrink-0 opacity-0 transition group-hover:opacity-60"
              />
            </a>
          ))}
        </div>
        <UpdatedAt value={query.dataUpdatedAt} demo={demo} />
      </div>
    </WidgetStatus>
  )
}

export const hackerNewsWidget: WidgetDefinition<Settings> = {
  type: 'hacker-news',
  version: 1,
  name: 'Hacker News',
  description: 'Top, new, or best stories from Hacker News.',
  category: 'news',
  icon: 'newspaper',
  component: HackerNewsWidget,
  defaultSize: { width: 4, height: 5 },
  minSize: { width: 3, height: 3 },
  defaultSettings: { feed: 'top', articleCount: 8, refreshMinutes: 10 },
  settingsFields: [
    {
      key: 'feed',
      type: 'select',
      label: 'Feed',
      options: [
        { value: 'top', label: 'Top stories' },
        { value: 'new', label: 'New stories' },
        { value: 'best', label: 'Best stories' },
      ],
    },
    { key: 'articleCount', type: 'number', label: 'Number of articles', min: 3, max: 20 },
    {
      key: 'refreshMinutes',
      type: 'number',
      label: 'Refresh interval (minutes)',
      min: 5,
      max: 120,
    },
  ],
  settingsSchema: schema,
}
