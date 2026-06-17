import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import type { Client } from '../types'

export function useClients() {
  const result = useLiveQuery(() =>
    db.clients
      .filter((c) => !c.archived)
      .sortBy('name')
  )
  const clients = result ?? []
  const loading = result === undefined

  const addClient = async (name: string, hourlyRate: number, color: string) => {
    await db.clients.add({
      id: crypto.randomUUID(),
      name,
      hourly_rate: hourlyRate,
      color,
      archived: false,
      created_at: new Date().toISOString(),
    })
  }

  const updateClient = async (
    id: string,
    updates: Partial<Pick<Client, 'name' | 'hourly_rate' | 'color'>>
  ) => {
    await db.clients.update(id, updates)
  }

  const archiveClient = async (id: string) => {
    await db.clients.update(id, { archived: true })
  }

  return { clients, loading, addClient, updateClient, archiveClient }
}
