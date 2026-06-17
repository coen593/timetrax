import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { Client, TimeEntry } from '../types'

class TimeTraxDB extends Dexie {
  clients!: Table<Client, string>
  time_entries!: Table<TimeEntry, string>

  constructor() {
    super('timetrax')
    this.version(1).stores({
      clients: 'id',
      time_entries: 'id, start_time',
    })
  }
}

export const db = new TimeTraxDB()
