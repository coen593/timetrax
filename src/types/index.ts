export type Client = {
  id: string
  name: string
  hourly_rate: number
  color: string
  archived: boolean
  created_at: string
}

export type TimeEntry = {
  id: string
  client_id: string
  start_time: string
  end_time: string | null
  duration_seconds: number | null
  note: string | null
  created_at: string
  client?: Client
}

export type TimePeriod = 'daily' | 'weekly' | 'monthly'

export type DateRange = {
  start: Date
  end: Date
}
