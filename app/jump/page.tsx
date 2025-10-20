"use client";

import { useEffect, useRef, useState } from "react";
import * as Phaser from "phaser";
import { MiniKit } from "@worldcoin/minikit-js";

export default function JumpPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [reviving, setReviving] = useState(false);
  const [top, setTop] = useState<{ id: string; score: number; ts: number }[]>([]);

  // 只在浏览器创建 Phaser
  useEffect(() => {
    if (typeof window === "undefined") return;
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 400,
      height: 600,
      parent: containerRef.current || undefined,
      scene: { preload() {}, create() {}, update() {} },
    };
    if (!gameRef.current) gameRef.current = new Phaser.Game(config);
    return () => gameRef.current?.destroy(true);
  }, []);

  // 拉取排行榜
  useEffect(() => {
    fetch("/api/score")
      .then((r) => r.json())
      .then((d) => setTop(d.top ?? []))
      .catch(() => {});
  }, []);

  // 支付 + 上报分数
  async function payToRevive(latestScore: number) {
    try {
      setReviving(true);
      const res = await MiniKit.commands.pay({
        reference: `revive-${Date.now()}`,
        description: "Revive in Jump Game",
        token: "WLD",
        amount: "0.01",
      } as any);
      console.log("pay result", res);

      const uid = "guest-" + (globalThis?.crypto?.randomUUID?.() ?? Date.now());
      await fetch("/api/score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: uid, score: latestScore }),
      });

      alert("已复活并上报分数");
    } catch (e) {
      console.error(e);
      alert("支付失败或取消");
    } finally {
      setReviving(false);
    }
  }

  return (
    <main style={{ padding: 16 }}>
      <h2>Jump Game</h2>
      <div ref={containerRef} id="game-container" />
      <button disabled={reviving} onClick={() => payToRevive(123)}>复活并上报分数</button>

      <div style={{ marginTop: 12 }}>
        <h3>排行榜 Top 50</h3>
        <ul>
          {top.map((r, i) => (
            <li key={r.ts}>#{i + 1} {r.id.slice(0, 8)}… — {r.score}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
