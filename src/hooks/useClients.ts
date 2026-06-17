import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Client } from '../types'

export function useClients() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchTrigger, setFetchTrigger] = useState(0)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('name')
      .then(({ data }) => {
        if (!cancelled) {
          setClients((data as Client[]) ?? [])
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [user, fetchTrigger])

  const refetch = useCallback(() => setFetchTrigger((n) => n + 1), [])

  const addClient = async (name: string, hourlyRate: number, color: string) => {
    if (!user) return
    const { data } = await supabase
      .from('clients')
      .insert({ user_id: user.id, name, hourly_rate: hourlyRate, color })
      .select()
      .single()
    if (data) setClients((prev) => [...prev, data as Client])
  }

  const updateClient = async (
    id: string,
    updates: Partial<Pick<Client, 'name' | 'hourly_rate' | 'color'>>
  ) => {
    const { data } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (data) setClients((prev) => prev.map((c) => (c.id === id ? (data as Client) : c)))
  }

  const archiveClient = async (id: string) => {
    await supabase.from('clients').update({ archived: true }).eq('id', id)
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  return { clients, loading, addClient, updateClient, archiveClient, refetch }
}
