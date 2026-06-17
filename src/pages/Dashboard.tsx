import { useState, useMemo } from 'react'
import { startOfDay, startOfWeek, startOfMonth, endOfDay } from 'date-fns'
import { Square, Trash2 } from 'lucide-react'
import { useClients } from '../hooks/useClients'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { useTimer } from '../hooks/useTimer'
import { OverviewCards } from '../components/OverviewCards'
import { TimeEntryList } from '../components/TimeEntryList'
import { formatElapsed } from '../lib/format'

export function Dashboard() {
  const { clients } = useClients()

  const range = useMemo(() => {
    const now = new Date()
    return { start: startOfMonth(now), end: endOfDay(now) }
  }, [])

  const { entries, deleteEntry } = useTimeEntries(range)
  const { isRunning, elapsed, activeEntry, start, stop, discard } = useTimer()
  const [note, setNote] = useState('')

  const stats = useMemo(() => {
    const now = new Date()
    const dayStart = startOfDay(now)
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const monthStart = startOfMonth(now)

    let todaySeconds = 0
    let weekSeconds = 0
    let monthSeconds = 0
    let monthEarnings = 0

    for (const entry of entries) {
      const entryDate = new Date(entry.start_time)
      const seconds = entry.duration_seconds ?? 0
      const rate = entry.client?.hourly_rate ?? 0

      if (entryDate >= monthStart) {
        monthSeconds += seconds
        monthEarnings += (seconds / 3600) * rate
      }
      if (entryDate >= weekStart) weekSeconds += seconds
      if (entryDate >= dayStart) todaySeconds += seconds
    }

    return { todaySeconds, weekSeconds, monthSeconds, monthEarnings }
  }, [entries])

  const recentEntries = entries.slice(0, 10)
  const activeClients = clients.filter((c) => !c.archived)

  const handleStop = async () => {
    await stop(note || undefined)
    setNote('')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      <OverviewCards {...stats} />

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          {isRunning ? 'Tracking' : 'Start Tracking'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {activeClients.map((client) => {
            const isActive = isRunning && activeEntry?.client_id === client.id
            return (
              <button
                key={client.id}
                onClick={() => start(client.id)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                  isActive
                    ? 'border-current bg-white shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
                style={isActive ? { borderColor: client.color, color: client.color } : undefined}
              >
                <div
                  className={`w-4 h-4 rounded-full ${isActive ? 'animate-pulse' : ''}`}
                  style={{ backgroundColor: client.color }}
                />
                <span className={isActive ? '' : 'text-gray-700'}>{client.name}</span>
                {isActive && (
                  <span className="text-lg font-mono font-bold tabular-nums">
                    {formatElapsed(elapsed)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {activeClients.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            Add clients first to start tracking time.
          </p>
        )}
      </div>

      {isRunning && activeEntry && (
        <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleStop()
            }}
          />
          <button
            onClick={() => discard()}
            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Discard"
          >
            <Trash2 size={20} />
          </button>
          <button
            onClick={handleStop}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            <Square size={16} fill="currentColor" />
            Stop
          </button>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Entries</h3>
        <TimeEntryList entries={recentEntries} onDelete={deleteEntry} />
      </div>
    </div>
  )
}
