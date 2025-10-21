type Row = { id: string; score: number; ts: number }
type DBSchema = { scores: Row[] }

let dbPromise:
  | Promise<{ data: DBSchema; write: () => Promise<void> }>
  | undefined

export async function getDB() {
  if (!dbPromise) {
    const { JSONFilePreset } = await import('lowdb/node')
    dbPromise = JSONFilePreset<DBSchema>('.data/scores.json', { scores: [] })
  }
  return dbPromise
}
