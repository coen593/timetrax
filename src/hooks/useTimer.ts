import { useState, useEffect, useRef, useCallback } from 'react'
import { db } from '../lib/db'
import type { TimeEntry } from '../types'

const STORAGE_KEY = 'timetrax_active_timer'

type StoredTimer = {
  entryId: string
  clientId: string
  startTime: string
}

export function useTimer() {
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
    if (!stored) return

    const timer: StoredTimer = JSON.parse(stored)
    db.time_entries.get(timer.entryId).then(async (entry) => {
      if (entry && !entry.end_time) {
        const client = await db.clients.get(entry.client_id)
        setActiveEntry({ ...entry, client: client ?? undefined })
        startCounting(timer.startTime)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    })
  }, [startCounting])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const start = async (clientId: string) => {
    if (isRunning) return
    const id = crypto.randomUUID()
    const startTime = new Date().toISOString()
    const entry: TimeEntry = {
      id,
      client_id: clientId,
      start_time: startTime,
      end_time: null,
      duration_minutes: null,
      note: null,
      created_at: startTime,
    }

    await db.time_entries.add(entry)
    const client = await db.clients.get(clientId)
    setActiveEntry({ ...entry, client: client ?? undefined })
    startCounting(startTime)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ entryId: id, clientId, startTime } satisfies StoredTimer)
    )
  }

  const stop = async (note?: string) => {
    if (!activeEntry) return
    const endTime = new Date().toISOString()
    const durationMinutes = Math.round(
      (new Date(endTime).getTime() - new Date(activeEntry.start_time).getTime()) / 60000
    )

    await db.time_entries.update(activeEntry.id, {
      end_time: endTime,
      duration_minutes: durationMinutes,
      note: note ?? null,
    })
    clearTimer()
  }

  const discard = async () => {
    if (!activeEntry) return
    await db.time_entries.delete(activeEntry.id)
    clearTimer()
  }

  return { isRunning, elapsed, activeEntry, start, stop, discard }
}
