import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import type { TimeEntry, DateRange } from '../types'

export function useTimeEntries(range?: DateRange) {
  const startISO = range && !isNaN(range.start.getTime()) ? range.start.toISOString() : null
  const endISO = range && !isNaN(range.end.getTime()) ? range.end.toISOString() : null

  const result = useLiveQuery(
    async () => {
      if (!startISO || !endISO) return []

      const raw = await db.time_entries
        .orderBy('start_time')
        .reverse()
        .filter(
          (e) =>
            e.end_time !== null && e.start_time >= startISO && e.start_time <= endISO
        )
        .toArray()

      const clientIds = [...new Set(raw.map((e) => e.client_id))]
      const clients = await db.clients.bulkGet(clientIds)
      const clientMap = new Map(
        clients.filter(Boolean).map((c) => [c!.id, c!])
      )

      return raw.map((e) => ({ ...e, client: clientMap.get(e.client_id) }))
    },
    [startISO, endISO]
  )

  const entries = result ?? []
  const loading = result === undefined

  const addEntry = async (
    clientId: string,
    startTime: string,
    endTime: string,
    durationSeconds: number,
    note?: string
  ) => {
    await db.time_entries.add({
      id: crypto.randomUUID(),
      client_id: clientId,
      start_time: startTime,
      end_time: endTime,
      duration_seconds: durationSeconds,
      note: note ?? null,
      created_at: new Date().toISOString(),
    })
  }

  const deleteEntry = async (id: string) => {
    await db.time_entries.delete(id)
  }

  return { entries: entries as TimeEntry[], loading, addEntry, deleteEntry }
}
