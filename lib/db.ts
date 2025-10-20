import { JSONFilePreset } from 'lowdb/node'

type Row = { id: string; score: number; ts: number }
type DBSchema = { scores: Row[] }

let dbPromise: Promise<ReturnType<typeof JSONFilePreset<DBSchema>>>

export function getDB() {
  if (!dbPromise) {
    dbPromise = JSONFilePreset<DBSchema>('.data/scores.json', { scores: [] })
  }
  return dbPromise
}
