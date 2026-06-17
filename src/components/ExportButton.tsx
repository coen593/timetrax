import { Download } from 'lucide-react'
import { format } from 'date-fns'
import type { TimeEntry } from '../types'

type Props = {
  entries: TimeEntry[]
  filename?: string
}

export function ExportButton({ entries, filename }: Props) {
  const handleExport = () => {
    const headers = [
      'Date',
      'Client',
      'Start',
      'End',
      'Duration (h)',
      'Hourly Rate (EUR)',
      'Amount (EUR)',
      'Note',
    ]
    const rows = entries.map((entry) => {
      const duration = entry.duration_seconds ? entry.duration_seconds / 3600 : 0
      const rate = entry.client?.hourly_rate ?? 0
      return [
        format(new Date(entry.start_time), 'yyyy-MM-dd'),
        entry.client?.name ?? '',
        format(new Date(entry.start_time), 'HH:mm'),
        entry.end_time ? format(new Date(entry.end_time), 'HH:mm') : '',
        duration.toFixed(2),
        rate.toFixed(2),
        (duration * rate).toFixed(2),
        entry.note ?? '',
      ]
    })

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename ?? `timetrax-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      disabled={entries.length === 0}
      className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50"
    >
      <Download size={16} />
      Export CSV
    </button>
  )
}
