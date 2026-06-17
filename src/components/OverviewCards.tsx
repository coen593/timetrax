import { formatDuration, formatCurrency } from '../lib/format'

type Props = {
  todayMinutes: number
  weekMinutes: number
  monthMinutes: number
  monthEarnings: number
}

export function OverviewCards({ todayMinutes, weekMinutes, monthMinutes, monthEarnings }: Props) {
  const cards = [
    { label: 'Today', value: formatDuration(todayMinutes) },
    { label: 'This Week', value: formatDuration(weekMinutes) },
    { label: 'This Month', value: formatDuration(monthMinutes) },
    { label: 'Month Earnings', value: formatCurrency(monthEarnings) },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {card.label}
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{card.value}</div>
        </div>
      ))}
    </div>
  )
}
