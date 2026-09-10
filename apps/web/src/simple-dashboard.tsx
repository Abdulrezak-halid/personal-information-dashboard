import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Bot,
  Check,
  CloudSun,
  Globe2,
  Landmark,
  MonitorCog,
  Plus,
  Timer,
  TrendingUp,
  X,
} from 'lucide-react'

type Weather = {
  temperature: number
  apparentTemperature: number
  weatherCode?: number
  condition?: string
  humidity?: number
  precipitation?: number
  wind?: number
  hourly: Array<{ time: string; temperature: number; condition?: string }>
  daily: Array<{ date: string; max: number; min: number; condition?: string }>
}
type Task = { id: string; title: string; done: boolean }
type CurrencyPoint = { date: string; rate: number }
type Headline = { id: string; title: string; url: string; source: string }
const starterTasks: Task[] = [
  { id: 'welcome', title: 'Plan today’s most important task', done: false },
  { id: 'review', title: 'Review your daily brief', done: false },
]

function weatherDescription(code: number) {
  if (code === 0) return 'Clear sky'
  if (code < 4) return 'Partly cloudy'
  if (code < 60) return 'Cloudy'
  if (code < 80) return 'Rain showers'
  return 'Wet weather'
}

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1_000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

function useWeather() {
  const [weather, setWeather] = useState<Weather | null>(null)
  useEffect(() => {
    let cancelled = false
    const fallback = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=36.8121&longitude=34.6415&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,precipitation,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=8&timezone=auto',
        )
        const data = await response.json()
        if (!cancelled && data.current)
          setWeather({
            temperature: data.current.temperature_2m,
            apparentTemperature: data.current.apparent_temperature,
            weatherCode: data.current.weather_code,
            humidity: data.current.relative_humidity_2m,
            precipitation: data.current.precipitation ? 100 : 0,
            wind: data.current.wind_speed_10m,
            hourly: data.hourly.time.slice(0, 24).map((time: string, index: number) => ({ time, temperature: data.hourly.temperature_2m[index], condition: weatherDescription(data.hourly.weather_code[index]) })),
            daily: data.daily.time.map((date: string, index: number) => ({ date, max: data.daily.temperature_2m_max[index], min: data.daily.temperature_2m_min[index], condition: weatherDescription(data.daily.weather_code[index]) })),
          })
      } catch {
        /* The card keeps a calm fallback when offline. */
      }
    }
    const load = () =>
      void fetch('/api/weather')
        .then(async (response) => {
          if (!response.ok) throw new Error('Meteosource unavailable')
          return response.json()
        })
        .then((data: Weather) => {
          if (!cancelled) setWeather(data)
        })
        .catch(() => void fallback())
    load()
    const refresh = window.setInterval(load, 10 * 60_000)
    return () => {
      cancelled = true
      window.clearInterval(refresh)
    }
  }, [])
  return weather
}

function useCurrency() {
  const [points, setPoints] = useState<CurrencyPoint[]>([])
  useEffect(() => {
    let cancelled = false
    void fetch('/api/currency')
      .then(async (response) => {
        if (!response.ok) throw new Error('Currency API unavailable')
        return response.json()
      })
      .then((data: { latest?: number; points?: CurrencyPoint[] }) => {
        if (!cancelled && data.latest)
          setPoints(
            data.points?.length
              ? data.points
              : [{ date: new Date().toISOString(), rate: data.latest }],
          )
      })
      .catch(async () => {
        try {
          const end = new Date()
          const start = new Date(end)
          start.setDate(end.getDate() - 13)
          const date = (value: Date) => value.toISOString().slice(0, 10)
          const response = await fetch(`https://api.frankfurter.dev/v1/${date(start)}..${date(end)}?base=USD&symbols=TRY`)
          const data = await response.json()
          if (!cancelled && data.rates) setPoints(Object.entries(data.rates).map(([day, rates]) => ({ date: day, rate: (rates as { TRY: number }).TRY })).filter((point) => point.rate))
        } catch { /* Keep the empty state informative when offline. */ }
      })
    return () => {
      cancelled = true
    }
  }, [])
  return points
}

function useHeadlines(kind: 'ai' | 'tech') {
  const [headlines, setHeadlines] = useState<Headline[]>([])
  useEffect(() => {
    let cancelled = false
    const url =
      kind === 'ai'
        ? 'https://hn.algolia.com/api/v1/search_by_date?query=artificial%20intelligence&tags=story&hitsPerPage=3'
        : 'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=3'
    void fetch(url)
      .then((response) => response.json())
      .then(
        (data: {
          hits?: Array<{ objectID: string; title?: string; url?: string; author?: string }>
        }) => {
          if (!cancelled)
            setHeadlines(
              (data.hits ?? [])
                .filter((item) => item.title)
                .map((item) => ({
                  id: item.objectID,
                  title: item.title!,
                  url: item.url || `https://news.ycombinator.com/item?id=${item.objectID}`,
                  source: item.author ? `by ${item.author}` : 'Hacker News',
                })),
            )
        },
      )
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [kind])
  return headlines
}

function CurrencyChart({ points }: { points: CurrencyPoint[] }) {
  if (!points.length) return <p className="muted-copy">Loading live USD / TRY rates…</p>
  const min = Math.min(...points.map((point) => point.rate))
  const max = Math.max(...points.map((point) => point.rate))
  const spread = max - min || 1
  const path = points
    .map(
      (point, index) =>
        `${index ? 'L' : 'M'} ${(index / Math.max(points.length - 1, 1)) * 100} ${42 - ((point.rate - min) / spread) * 34}`,
    )
    .join(' ')
  const latest = points.at(-1)!
  const first = points[0]!
  const change = ((latest.rate - first.rate) / first.rate) * 100
  return (
    <>
      <div className="currency-summary">
        <strong>₺{latest.rate.toFixed(2)}</strong>
        <span className={change >= 0 ? 'positive' : 'negative'}>
          {points.length > 1
            ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}% · 2 weeks`
            : 'Current rate'}
        </span>
      </div>
      {points.length > 1 && (
        <svg
          className="currency-chart"
          viewBox="0 0 100 46"
          preserveAspectRatio="none"
          aria-label="USD to Turkish lira exchange-rate chart"
        >
          <path className="chart-area" d={`${path} L 100 46 L 0 46 Z`} />
          <path className="chart-line" d={path} />
        </svg>
      )}
      <p className="card-footnote">USD / TRY · CurrencyAPI live data</p>
    </>
  )
}

function WeatherPanel({ weather }: { weather: Weather | null }) {
  if (!weather) return <p className="muted-copy">Fetching Mersin conditions…</p>
  const hourly = weather.hourly.filter((_, index) => index % 4 === 0).slice(0, 6)
  const daily = weather.daily.slice(0, 8)
  const max = Math.max(...hourly.map((point) => point.temperature))
  const min = Math.min(...hourly.map((point) => point.temperature))
  const spread = max - min || 1
  const path = hourly
    .map((point, index) => `${index ? 'L' : 'M'} ${(index / Math.max(hourly.length - 1, 1)) * 100} ${42 - ((point.temperature - min) / spread) * 30}`)
    .join(' ')
  return <>
    <div className="weather-hero"><strong>☀ <span>{Math.round(weather.temperature)}°</span></strong><div><span>{weather.condition || weatherDescription(weather.weatherCode ?? 0)}</span><small>Yağış: {weather.precipitation ?? 0}%<br />Nem: {weather.humidity ?? '–'}%<br />Rüzgar: {Math.round(weather.wind ?? 0)} km/s</small></div></div>
    <div className="weather-tabs"><b>Sıcaklık</b><span>Yağış</span><span>Rüzgar</span></div>
    {hourly.length > 1 && <><svg className="weather-chart" viewBox="0 0 100 46" preserveAspectRatio="none"><path className="weather-area" d={`${path} L 100 46 L 0 46 Z`} /><path className="weather-line" d={path} /></svg><div className="weather-hours">{hourly.map((point) => <span key={point.time}>{new Date(point.time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>)}</div></>}
    <div className="forecast-days">{daily.map((day) => <div key={day.date}><b>{new Date(`${day.date}T12:00`).toLocaleDateString('tr-TR', { weekday: 'short' })}</b><span>☀</span><small>{Math.round(day.max)}° <i>{Math.round(day.min)}°</i></small></div>)}</div>
  </>
}

function Headlines({ headlines }: { headlines: Headline[] }) {
  return (
    <div className="headline-list">
      {headlines.length ? (
        headlines.map((headline) => (
          <a href={headline.url} key={headline.id} className="headline" title={headline.title}>
            <span>{headline.title}</span>
            <small>{headline.source}</small>
          </a>
        ))
      ) : (
        <p className="muted-copy">Loading latest headlines…</p>
      )}
    </div>
  )
}

function Card({
  title,
  icon,
  children,
  href,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  href?: string
}) {
  const content = (
    <>
      <div className="simple-card-heading">
        <span className="simple-card-icon">{icon}</span>
        <span>{title}</span>
        {href && <ArrowUpRight size={16} className="simple-card-arrow" />}
      </div>
      {children}
    </>
  )
  return href ? (
    <a className="simple-card simple-card-link" href={href} aria-label={`Open ${title}`}>
      {content}
    </a>
  ) : (
    <section className="simple-card">{content}</section>
  )
}

export function SimpleDashboard() {
  const now = useClock()
  const weather = useWeather()
  const currency = useCurrency()
  const aiHeadlines = useHeadlines('ai')
  const techHeadlines = useHeadlines('tech')
  const [compact, setCompact] = useState(
    () => localStorage.getItem('dashboard-density') === 'compact',
  )
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('simple-dashboard-tasks') ?? '') as Task[]
    } catch {
      return starterTasks
    }
  })
  const [taskText, setTaskText] = useState('')
  useEffect(() => localStorage.setItem('simple-dashboard-tasks', JSON.stringify(tasks)), [tasks])
  useEffect(
    () => localStorage.setItem('dashboard-density', compact ? 'compact' : 'comfortable'),
    [compact],
  )
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ')
  const time = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(now),
    [now],
  )
  const gregorian = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now),
    [now],
  )
  const hijri = useMemo(
    () =>
      new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(now),
    [now],
  )
  const addTask = (event: React.FormEvent) => {
    event.preventDefault()
    const title = taskText.trim()
    if (!title) return
    setTasks((current) => [...current, { id: crypto.randomUUID(), title, done: false }])
    setTaskText('')
  }

  return (
    <main className={`simple-dashboard ${compact ? 'is-compact' : ''}`}>
      <header className="simple-header">
        <div>
          <p className="simple-kicker">Personal dashboard</p>
          <h1>Everything important, in one place.</h1>
        </div>
        <button className="density-toggle" onClick={() => setCompact((value) => !value)}>
          {compact ? 'Comfortable view' : 'Compact view'}
        </button>
      </header>
      <div className="simple-grid">
        <Card title="Date & time" icon={<Timer size={18} />}>
          <div className="time-value">{time}</div>
          <p className="time-zone">{localZone}</p>
          <div className="date-pair">
            <span>Gregorian</span>
            <strong>{gregorian}</strong>
          </div>
          <div className="date-pair">
            <span>Hijri</span>
            <strong className="hijri-date" lang="ar" dir="rtl">
              {hijri}
            </strong>
          </div>
        </Card>
        <Card title="Weather" icon={<CloudSun size={18} />}>
          <WeatherPanel weather={weather} />
          <p className="card-footnote">Mersin, Türkiye · live conditions</p>
        </Card>
        <Card title="Currency index" icon={<Landmark size={18} />}>
          <CurrencyChart points={currency} />
        </Card>
        <Card title="Markets" icon={<TrendingUp size={18} />} href="https://finance.yahoo.com/">
          <p className="card-lead">Brands, stocks & market moves</p>
          <div className="index-list">
            <span>S&P 500</span>
            <span>NASDAQ</span>
            <span>Global brands</span>
          </div>
          <p className="card-footnote">Open the market index</p>
        </Card>
        <Card
          title="Global statistics"
          icon={<Globe2 size={18} />}
          href="https://www.worldometers.info/"
        >
          <p className="card-lead">The world, at a glance</p>
          <p className="muted-copy">
            Population, countries, health, environment and live global counters.
          </p>
          <p className="card-footnote">Worldometer</p>
        </Card>
        <Card title="AI news" icon={<Bot size={18} />}>
          <Headlines headlines={aiHeadlines} />
          <a className="card-footnote source-link" href="https://hn.algolia.com/">
            Live Hacker News search
          </a>
        </Card>
        <Card title="Programming & tech" icon={<MonitorCog size={18} />}>
          <Headlines headlines={techHeadlines} />
          <a className="card-footnote source-link" href="https://news.ycombinator.com/">
            Hacker News front page
          </a>
        </Card>
        <Card title="Tasks" icon={<Check size={18} />}>
          <div className="task-list">
            {tasks.map((task) => (
              <div className="task-row" key={task.id}>
                <button
                  className={`task-check ${task.done ? 'done' : ''}`}
                  onClick={() =>
                    setTasks((items) =>
                      items.map((item) =>
                        item.id === task.id ? { ...item, done: !item.done } : item,
                      ),
                    )
                  }
                  aria-label={`Mark ${task.title} ${task.done ? 'incomplete' : 'complete'}`}
                >
                  <Check size={13} />
                </button>
                <span className={task.done ? 'task-done' : ''}>{task.title}</span>
                <button
                  className="task-remove"
                  onClick={() => setTasks((items) => items.filter((item) => item.id !== task.id))}
                  aria-label={`Remove ${task.title}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <form className="task-add" onSubmit={addTask}>
            <input
              value={taskText}
              onChange={(event) => setTaskText(event.target.value)}
              placeholder="Add a task"
              aria-label="New task"
            />
            <button aria-label="Add task">
              <Plus size={16} />
            </button>
          </form>
        </Card>
      </div>
    </main>
  )
}
