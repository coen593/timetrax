import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { TimeEntry, DateRange } from '../types'

export function useTimeEntries(range?: DateRange) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchTrigger, setFetchTrigger] = useState(0)

  useEffect(() => {
    if (!user || !range) return
    if (isNaN(range.start.getTime()) || isNaN(range.end.getTime())) return
    let cancelled = false

    supabase
      .from('time_entries')
      .select('*, client:clients(*)')
      .eq('user_id', user.id)
      .not('end_time', 'is', null)
      .gte('start_time', range.start.toISOString())
      .lte('start_time', range.end.toISOString())
      .order('start_time', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) {
          setEntries((data as TimeEntry[]) ?? [])
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [user, range, fetchTrigger])

  const refetch = useCallback(() => setFetchTrigger((n) => n + 1), [])

  const addEntry = async (
    clientId: string,
    startTime: string,
    endTime: string,
    durationMinutes: number,
    note?: string
  ) => {
    if (!user) return
    const { data } = await supabase
      .from('time_entries')
      .insert({
        user_id: user.id,
        client_id: clientId,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        note: note ?? null,
      })
      .select('*, client:clients(*)')
      .single()
    if (data) setEntries((prev) => [data as TimeEntry, ...prev])
  }

  const deleteEntry = async (id: string) => {
    await supabase.from('time_entries').delete().eq('id', id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return { entries, loading, addEntry, deleteEntry, refetch }
}
