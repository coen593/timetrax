import { useState } from 'react'
import { Plus, Pencil, Archive } from 'lucide-react'
import { useClients } from '../hooks/useClients'
import { useToast } from '../hooks/useToast'
import { ClientForm } from '../components/ClientForm'
import { formatCurrency } from '../lib/format'
import type { Client } from '../types'

export function Clients() {
  const { clients, addClient, updateClient, archiveClient } = useClients()
  const { showToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | undefined>()

  const handleSubmit = async (name: string, hourlyRate: number, color: string) => {
    if (editingClient) {
      await updateClient(editingClient.id, { name, hourly_rate: hourlyRate, color })
      showToast('Client updated')
    } else {
      await addClient(name, hourlyRate, color)
      showToast('Client added')
    }
  }

  const handleClose = () => {
    setShowForm(false)
    setEditingClient(undefined)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          <Plus size={16} />
          Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No clients yet. Add your first client to start tracking time.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <div key={client.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: client.color }}
                  />
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingClient(client)
                      setShowForm(true)
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={async () => {
                      await archiveClient(client.id)
                      showToast('Client archived')
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="Archive"
                  >
                    <Archive size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-500">
                {formatCurrency(client.hourly_rate)} / hour
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm || editingClient) && (
        <ClientForm client={editingClient} onSubmit={handleSubmit} onClose={handleClose} />
      )}
    </div>
  )
}
