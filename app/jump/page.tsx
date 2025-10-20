"use client";
import { useEffect, useRef, useState } from "react";
import * as Phaser from "phaser";
import { MiniKit } from "@worldcoin/minikit-js";

class MainScene extends Phaser.Scene {
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  scoreText!: Phaser.GameObjects.Text;
  score = 0;
  create() {
    const { width, height } = this.scale;
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(width/2, height-20, "").setDisplaySize(width, 40).refreshBody();
    this.platforms.create(width*0.3, height*0.7, "").setDisplaySize(120, 16).refreshBody();
    this.platforms.create(width*0.7, height*0.5, "").setDisplaySize(120, 16).refreshBody();
    this.player = this.physics.add.sprite(width/2, height-60, "");
    this.player.setDisplaySize(28, 28).setBounce(0.1).setCollideWorldBounds(true);
    this.player.body.setGravityY(600);
    this.physics.add.collider(this.player, this.platforms);
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.scoreText = this.add.text(12, 12, "Score: 0", { color: "#ffffff" });
    this.time.addEvent({ delay: 1000, loop: true, callback: () => {
      this.score += 1; this.scoreText.setText(`Score: ${this.score}`);
    }});
  }
  update() {
    const s = 180;
    if (this.cursors.left?.isDown) this.player.setVelocityX(-s);
    else if (this.cursors.right?.isDown) this.player.setVelocityX(s);
    else this.player.setVelocityX(0);
    if ((this.cursors.up?.isDown || this.input.activePointer.isDown) && this.player.body.blocked.down) {
      this.player.setVelocityY(-360);
    }
  }
}

export default function JumpPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [reviving, setReviving] = useState(false);
  useEffect(() => {
    if (!mountRef.current || gameRef.current) return;
    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO, width: 360, height: 640, parent: mountRef.current,
      backgroundColor: "#1b1e23", physics: { default: "arcade", arcade: { debug: false } },
      scene: [MainScene],
    });
    return () => { gameRef.current?.destroy(true); gameRef.current = null; };
  }, []);
  async function payToRevive() {
    try {
      setReviving(true);
      const res = await MiniKit.commands.pay({
        reference: `revive-${Date.now()}`,
        description: "Revive in Jump Game",
        payments: [{ token: "WLD", amount: "0.01" }],
      });
      console.log("pay result:", res);
      // TODO: 支付成功后复活/加体力
    } catch (e) { console.error(e); alert("支付失败或取消"); }
    finally { setReviving(false); }
  }
  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div ref={mountRef} />
      <button onClick={payToRevive} disabled={reviving}
        className="px-4 py-2 rounded-xl bg-white/10 text-white">
        {reviving ? "处理中…" : "支付复活（WLD 0.01）"}
      </button>
    </div>
  );
}
