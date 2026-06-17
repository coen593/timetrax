import { useState } from 'react'
import { format } from 'date-fns'
import { Trash2, X } from 'lucide-react'
import { formatDuration, formatCurrency } from '../lib/format'
import type { TimeEntry } from '../types'

type Props = {
  entries: TimeEntry[]
  onDelete: (id: string) => void
}

export function TimeEntryList({ entries, onDelete }: Props) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  if (entries.length === 0) {
    return <div className="text-center py-12 text-gray-400 text-sm">No time entries yet</div>
  }

  return (
    <>
      <div className="space-y-2">
        {entries.map((entry) => {
          const duration = entry.duration_seconds ?? 0
          const rate = entry.client?.hourly_rate ?? 0
          const amount = (duration / 3600) * rate
          return (
            <div
              key={entry.id}
              className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 px-4 py-3"
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.client?.color ?? '#3B82F6' }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {entry.client?.name ?? 'Unknown'}
                  </span>
                  {entry.note && (
                    <span className="text-xs text-gray-400 truncate">&mdash; {entry.note}</span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {format(new Date(entry.start_time), 'HH:mm')}
                  {' - '}
                  {entry.end_time ? format(new Date(entry.end_time), 'HH:mm') : '...'}
                  {' | '}
                  {format(new Date(entry.start_time), 'MMM d, yyyy')}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-medium text-gray-900">{formatDuration(duration)}</div>
                {rate > 0 && <div className="text-xs text-gray-400">{formatCurrency(amount)}</div>}
              </div>
              <button
                onClick={() => setPendingDeleteId(entry.id)}
                className="p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}
      </div>

      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Whoopsie daisy!</h3>
              <button
                onClick={() => setPendingDeleteId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Are you suuure? This time entry will vanish into the void, never to return.
              Not even Coen can save it. Pinky promise you meant to do that?
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Nope, my bad
              </button>
              <button
                onClick={() => {
                  onDelete(pendingDeleteId)
                  setPendingDeleteId(null)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Pinky promise, delete it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
