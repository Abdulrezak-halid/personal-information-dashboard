import { useQuery } from '@tanstack/react-query'
import { ExternalLink, ServerOff } from 'lucide-react'
import { z } from 'zod'
import type { WidgetComponentProps, WidgetDefinition } from '@/dashboard/types'
import { demoFeed } from '@/providers/feeds'
import { providerRegistry } from '@/providers/registry'
import { UpdatedAt, WidgetStatus } from '@/widgets/shared/widget-state'

const schema = z.object({
  url: z.string().url(),
  title: z.string().min(1).max(80),
  articleCount: z.number().int().min(3).max(30),
  refreshMinutes: z.number().int().min(5).max(240),
})
type Settings = z.infer<typeof schema>

function RssWidget({ settings, demo }: WidgetComponentProps<Settings>) {
  const query = useQuery({
    queryKey: ['feed', 'rss', settings.url, settings.articleCount, demo],
    queryFn: () =>
      demo
        ? Promise.resolve(demoFeed.slice(0, settings.articleCount))
        : providerRegistry.feed.rss.getItems({ url: settings.url, limit: settings.articleCount }),
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
        <div className="min-h-0 flex-1 space-y-1 overflow-auto">
          {query.data?.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start justify-between gap-3 rounded-lg px-2 py-2 hover:bg-white/5"
            >
              <span>
                <span className="line-clamp-2 text-sm group-hover:text-cyan-200">{item.title}</span>
                {item.publishedAt && (
                  <span className="mt-1 block text-[10px] text-(--muted)">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </span>
              <ExternalLink size={12} className="mt-1 shrink-0 opacity-40" />
            </a>
          ))}
        </div>
        <UpdatedAt value={query.dataUpdatedAt} demo={demo} />
      </div>
    </WidgetStatus>
  )
}

export const rssWidget: WidgetDefinition<Settings> = {
  type: 'rss',
  version: 1,
  name: 'RSS Feed',
  description: 'Any RSS or Atom feed through the secure server service.',
  category: 'news',
  icon: 'rss',
  component: RssWidget,
  defaultSize: { width: 4, height: 5 },
  minSize: { width: 3, height: 3 },
  defaultSettings: {
    url: 'https://hnrss.org/frontpage',
    title: 'My Feed',
    articleCount: 8,
    refreshMinutes: 15,
  },
  settingsFields: [
    {
      key: 'url',
      type: 'url',
      label: 'RSS or Atom URL',
      placeholder: 'https://example.com/feed.xml',
      help: 'Requires Server Mode.',
    },
    { key: 'title', type: 'text', label: 'Widget title' },
    { key: 'articleCount', type: 'number', label: 'Number of articles', min: 3, max: 30 },
    {
      key: 'refreshMinutes',
      type: 'number',
      label: 'Refresh interval (minutes)',
      min: 5,
      max: 240,
    },
  ],
  settingsSchema: schema,
}

export function RssServerHint() {
  return (
    <div className="flex items-center gap-2 text-xs text-(--muted)">
      <ServerOff size={14} />
      RSS is unavailable in static-only mode.
    </div>
  )
}
