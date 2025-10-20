import { NextResponse } from 'next/server'
import { getDB } from '../../../lib/db'

export async function GET() {
  const db = await getDB()
  const top = [...db.data.scores]
    .sort((a, b) => b.score - a.score || a.ts - b.ts)
    .slice(0, 50)
  return NextResponse.json({ top })
}

// body: { id: string; score: number }
export async function POST(req: Request) {
  try {
    const { id, score } = await req.json() as { id?: string; score?: number }
    if (!id || typeof score !== 'number') {
      return NextResponse.json({ error: 'bad_request' }, { status: 400 })
    }
    const db = await getDB()
    db.data.scores.push({ id, score, ts: Date.now() })
    await db.write()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 })
  }
}
