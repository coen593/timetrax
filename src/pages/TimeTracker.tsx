import { useState, useMemo } from 'react'
import { startOfDay, endOfDay } from 'date-fns'
import { Play } from 'lucide-react'
import { useClients } from '../hooks/useClients'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { useTimer } from '../hooks/useTimer'
import { useToast } from '../hooks/useToast'
import { Timer } from '../components/Timer'
import { ManualEntryForm } from '../components/ManualEntryForm'
import { TimeEntryList } from '../components/TimeEntryList'

export function TimeTracker() {
  const { clients } = useClients()

  const range = useMemo(() => {
    const now = new Date()
    return { start: startOfDay(now), end: endOfDay(now) }
  }, [])

  const { entries, addEntry, deleteEntry } = useTimeEntries(range)
  const [selectedClientId, setSelectedClientId] = useState('')
  const { isRunning, elapsed, activeEntry, start, stop, discard } = useTimer()
  const { showToast } = useToast()

  const handleStartTimer = async () => {
    if (!selectedClientId) return
    await start(selectedClientId)
  }

  const handleStopTimer = async (note?: string) => {
    await stop(note)
    showToast('Time entry saved')
  }

  const handleManualEntry = async (
    clientId: string,
    startTime: string,
    endTime: string,
    durationSeconds: number,
    note?: string
  ) => {
    await addEntry(clientId, startTime, endTime, durationSeconds, note)
    showToast('Time entry added')
  }

  const handleDelete = async (id: string) => {
    await deleteEntry(id)
    showToast('Time entry deleted')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Time Tracker</h2>

      {isRunning && activeEntry ? (
        <Timer entry={activeEntry} elapsed={elapsed} onStop={handleStopTimer} onDiscard={discard} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Start Timer</h3>
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
              Start
            </button>
          </div>
        </div>
      )}

      <ManualEntryForm clients={clients} onSubmit={handleManualEntry} />

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Today's Entries</h3>
        <TimeEntryList entries={entries} onDelete={handleDelete} />
      </div>
    </div>
  )
}
