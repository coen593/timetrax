import { useState, useMemo } from 'react'
import { startOfDay, startOfWeek, startOfMonth, endOfDay } from 'date-fns'
import { Play } from 'lucide-react'
import { useClients } from '../hooks/useClients'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { useTimer } from '../hooks/useTimer'
import { OverviewCards } from '../components/OverviewCards'
import { Timer } from '../components/Timer'
import { TimeEntryList } from '../components/TimeEntryList'

export function Dashboard() {
  const { clients } = useClients()

  const range = useMemo(() => {
    const now = new Date()
    return { start: startOfMonth(now), end: endOfDay(now) }
  }, [])

  const { entries, deleteEntry, refetch } = useTimeEntries(range)
  const [selectedClientId, setSelectedClientId] = useState('')
  const { isRunning, elapsed, activeEntry, start, stop, discard } = useTimer(refetch)

  const stats = useMemo(() => {
    const now = new Date()
    const dayStart = startOfDay(now)
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const monthStart = startOfMonth(now)

    let todayMinutes = 0
    let weekMinutes = 0
    let monthMinutes = 0
    let monthEarnings = 0

    for (const entry of entries) {
      const entryDate = new Date(entry.start_time)
      const minutes = entry.duration_minutes ?? 0
      const rate = entry.client?.hourly_rate ?? 0

      if (entryDate >= monthStart) {
        monthMinutes += minutes
        monthEarnings += (minutes / 60) * rate
      }
      if (entryDate >= weekStart) weekMinutes += minutes
      if (entryDate >= dayStart) todayMinutes += minutes
    }

    return { todayMinutes, weekMinutes, monthMinutes, monthEarnings }
  }, [entries])

  const recentEntries = entries.slice(0, 10)

  const handleStartTimer = async () => {
    if (!selectedClientId) return
    await start(selectedClientId)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      <OverviewCards {...stats} />

      {isRunning && activeEntry ? (
        <Timer entry={activeEntry} elapsed={elapsed} onStop={stop} onDiscard={discard} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Start</h3>
          <div className="flex gap-3">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleStartTimer}
              disabled={!selectedClientId}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50"
            >
              <Play size={16} fill="currentColor" />
              Start Timer
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Entries</h3>
        <TimeEntryList entries={recentEntries} onDelete={deleteEntry} />
      </div>
    </div>
  )
}
