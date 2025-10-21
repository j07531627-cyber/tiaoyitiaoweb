'use client'
import { useEffect, useRef, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

type Row = { id:string; score:number; ts:number }

export default function JumpPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<any>(null)
  const sceneRef = useRef<any>(null)
  const [latestScore, setLatestScore] = useState(0)
  const [reviving, setReviving] = useState(false)
  const [top, setTop] = useState<Row[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    let destroyed = false
    ;(async () => {
      const Phaser = await import('phaser')
      const { JumpScene } = await import('@/components/game/JumpScene')
      sceneRef.current = new JumpScene()
      sceneRef.current.events.on('gameover', (s:number) => setLatestScore(s))
      const config: any = {
        type: Phaser.AUTO,
        width: 400, height: 600,
        parent: containerRef.current ?? undefined,
        backgroundColor: '#222',
        physics: { default: 'arcade', arcade: { gravity: { y: 500 } } },
        scene: [sceneRef.current],
      }
      if (!destroyed) gameRef.current = new Phaser.Game(config)
    })()
    return () => { destroyed = true; gameRef.current?.destroy?.(true) }
  }, [])

  useEffect(() => {
    fetch('/api/score').then(r=>r.json()).then(d=>setTop(d.top ?? [])).catch(()=>{})
  }, [])

  async function payToRevive() {
    try {
      setReviving(true)
      const res = await MiniKit.commands.pay({
        reference: `revive-${Date.now()}`,
        description: 'Revive in Jump Game',
        token: 'WLD',
        amount: '0.01',
      } as any)
      console.log('pay result', res)
      sceneRef.current?.revive?.()
      const uid = 'guest-' + (globalThis?.crypto?.randomUUID?.() ?? Date.now())
      await fetch('/api/score', {
        method:'POST',
        headers:{ 'content-type':'application/json' },
        body: JSON.stringify({ id: uid, score: latestScore })
      })
      fetch('/api/score').then(r=>r.json()).then(d=>setTop(d.top ?? []))
      alert('已复活并上报分数')
    } catch(e) {
      console.error(e); alert('支付失败或取消')
    } finally { setReviving(false) }
  }

  return (
    <main style={{ padding:16 }}>
      <h2>Jump Game</h2>
      <div ref={containerRef} id="game-container" />
      <div style={{ marginTop:8 }}>
        <button onClick={()=>sceneRef.current?.start?.()}>重新开始</button>
        <button style={{ marginLeft:8 }} disabled={reviving} onClick={payToRevive}>
          复活并上报分数（WLD 0.01）
        </button>
        <span style={{ marginLeft:12 }}>最近分数：{latestScore}</span>
      </div>
      <div style={{ marginTop:12 }}>
        <h3>排行榜 Top 50</h3>
        <ul>
          {top.map((r,i)=>(<li key={r.ts}>#{i+1} {r.id.slice(0,8)}… — {r.score}</li>))}
        </ul>
      </div>
    </main>
  )
}
