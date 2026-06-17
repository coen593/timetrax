import { useState } from 'react'
import { Square, Trash2 } from 'lucide-react'
import { formatElapsed } from '../lib/format'
import type { TimeEntry } from '../types'

type Props = {
  entry: TimeEntry
  elapsed: number
  onStop: (note?: string) => void
  onDiscard: () => void
}

export function Timer({ entry, elapsed, onStop, onDiscard }: Props) {
  const [note, setNote] = useState('')

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: entry.client?.color ?? '#3B82F6' }}
            />
            <span className="text-sm font-medium text-gray-600">
              {entry.client?.name ?? 'Unknown client'}
            </span>
          </div>
          <div className="text-4xl font-mono font-bold text-gray-900 tabular-nums">
            {formatElapsed(elapsed)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDiscard}
            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Discard"
          >
            <Trash2 size={20} />
          </button>
          <button
            onClick={() => onStop(note || undefined)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <Square size={16} fill="currentColor" />
            Stop
          </button>
        </div>
      </div>
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note (optional)..."
        className="mt-4 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onKeyDown={(e) => {
          if (e.key === 'Enter') onStop(note || undefined)
        }}
      />
    </div>
  )
}
