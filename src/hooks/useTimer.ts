import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { TimeEntry } from '../types'

const STORAGE_KEY = 'timetrax_active_timer'

type StoredTimer = {
  entryId: string
  clientId: string
  startTime: string
}

export function useTimer(onStop?: () => void) {
  const { user } = useAuth()
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setElapsed(0)
    setIsRunning(false)
    setActiveEntry(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const startCounting = useCallback((startTime: string) => {
    const start = new Date(startTime).getTime()
    const update = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    update()
    intervalRef.current = setInterval(update, 1000)
    setIsRunning(true)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored || !user) return

    const timer: StoredTimer = JSON.parse(stored)
    supabase
      .from('time_entries')
      .select('*, client:clients(*)')
      .eq('id', timer.entryId)
      .is('end_time', null)
      .single()
      .then(({ data }) => {
        if (data) {
          setActiveEntry(data as TimeEntry)
          startCounting(timer.startTime)
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      })
  }, [user, startCounting])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const start = async (clientId: string) => {
    if (!user || isRunning) return
    const startTime = new Date().toISOString()
    const { data } = await supabase
      .from('time_entries')
      .insert({
        user_id: user.id,
        client_id: clientId,
        start_time: startTime,
      })
      .select('*, client:clients(*)')
      .single()

    if (data) {
      setActiveEntry(data as TimeEntry)
      startCounting(startTime)
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ entryId: data.id, clientId, startTime } satisfies StoredTimer)
      )
    }
  }

  const stop = async (note?: string) => {
    if (!activeEntry) return
    const endTime = new Date().toISOString()
    const durationMinutes = Math.round(
      (new Date(endTime).getTime() - new Date(activeEntry.start_time).getTime()) / 60000
    )

    await supabase
      .from('time_entries')
      .update({ end_time: endTime, duration_minutes: durationMinutes, note: note ?? null })
      .eq('id', activeEntry.id)

    clearTimer()
    onStop?.()
  }

  const discard = async () => {
    if (!activeEntry) return
    await supabase.from('time_entries').delete().eq('id', activeEntry.id)
    clearTimer()
  }

  return { isRunning, elapsed, activeEntry, start, stop, discard }
}
