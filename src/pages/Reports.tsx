import { useState, useMemo } from 'react'
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isWithinInterval,
  subMonths,
} from 'date-fns'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { useClients } from '../hooks/useClients'
import { ExportButton } from '../components/ExportButton'
import { formatDuration, formatCurrency } from '../lib/format'
import type { TimePeriod, TimeEntry } from '../types'

type GroupedData = {
  label: string
  entries: TimeEntry[]
  totalSeconds: number
  totalEarnings: number
}

function groupEntries(entries: TimeEntry[], period: TimePeriod): GroupedData[] {
  if (entries.length === 0) return []

  const sorted = [...entries].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )

  const first = new Date(sorted[0].start_time)
  const last = new Date(sorted[sorted.length - 1].start_time)

  let intervals: { start: Date; end: Date; label: string }[]

  if (period === 'daily') {
    intervals = eachDayOfInterval({ start: first, end: last }).map((d) => ({
      start: startOfDay(d),
      end: endOfDay(d),
      label: format(d, 'EEE, MMM d'),
    }))
  } else if (period === 'weekly') {
    intervals = eachWeekOfInterval({ start: first, end: last }, { weekStartsOn: 1 }).map((d) => ({
      start: startOfWeek(d, { weekStartsOn: 1 }),
      end: endOfWeek(d, { weekStartsOn: 1 }),
      label: `Week of ${format(startOfWeek(d, { weekStartsOn: 1 }), 'MMM d')}`,
    }))
  } else {
    intervals = eachMonthOfInterval({ start: first, end: last }).map((d) => ({
      start: startOfMonth(d),
      end: endOfMonth(d),
      label: format(d, 'MMMM yyyy'),
    }))
  }

  return intervals
    .map(({ start, end, label }) => {
      const grouped = entries.filter((e) =>
        isWithinInterval(new Date(e.start_time), { start, end })
      )
      const totalSeconds = grouped.reduce((sum, e) => sum + (e.duration_seconds ?? 0), 0)
      const totalEarnings = grouped.reduce((sum, e) => {
        const seconds = e.duration_seconds ?? 0
        const rate = e.client?.hourly_rate ?? 0
        return sum + (seconds / 3600) * rate
      }, 0)
      return { label, entries: grouped, totalSeconds, totalEarnings }
    })
    .filter((g) => g.entries.length > 0)
    .reverse()
}

export function Reports() {
  const { clients } = useClients()
  const [startDate, setStartDate] = useState(() =>
    format(subMonths(new Date(), 1), 'yyyy-MM-dd')
  )
  const [endDate, setEndDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [clientFilter, setClientFilter] = useState('')
  const [period, setPeriod] = useState<TimePeriod>('daily')

  const range = useMemo(
    () => ({
      start: startOfDay(new Date(startDate)),
      end: endOfDay(new Date(endDate)),
    }),
    [startDate, endDate]
  )

  const { entries, loading } = useTimeEntries(range)

  const filtered = useMemo(
    () => (clientFilter ? entries.filter((e) => e.client_id === clientFilter) : entries),
    [entries, clientFilter]
  )

  const grouped = useMemo(() => groupEntries(filtered, period), [filtered, period])

  const totals = useMemo(() => {
    const totalSeconds = filtered.reduce((sum, e) => sum + (e.duration_seconds ?? 0), 0)
    const totalEarnings = filtered.reduce((sum, e) => {
      const seconds = e.duration_seconds ?? 0
      const rate = e.client?.hourly_rate ?? 0
      return sum + (seconds / 3600) * rate
    }, 0)
    return { totalSeconds, totalEarnings }
  }, [filtered])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        <ExportButton entries={filtered} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Client</label>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Group by</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as TimePeriod)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Total Hours
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {formatDuration(totals.totalSeconds)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Total Earnings
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {formatCurrency(totals.totalEarnings)}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No entries for this period</div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.label}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">{group.label}</h3>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>{formatDuration(group.totalSeconds)}</span>
                  <span>{formatCurrency(group.totalEarnings)}</span>
                </div>
              </div>
              <div className="space-y-1">
                {group.entries.map((entry) => {
                  const duration = entry.duration_seconds ?? 0
                  const rate = entry.client?.hourly_rate ?? 0
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-4 py-2.5 text-sm"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: entry.client?.color ?? '#3B82F6' }}
                      />
                      <span className="font-medium text-gray-900 w-32 truncate">
                        {entry.client?.name}
                      </span>
                      <span className="text-gray-400">
                        {format(new Date(entry.start_time), 'HH:mm')} -{' '}
                        {entry.end_time ? format(new Date(entry.end_time), 'HH:mm') : '...'}
                      </span>
                      <span className="text-gray-500 flex-1 truncate">{entry.note}</span>
                      <span className="font-medium text-gray-900">{formatDuration(duration)}</span>
                      <span className="text-gray-500 w-24 text-right">
                        {formatCurrency((duration / 3600) * rate)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
