import * as Phaser from 'phaser'

export class JumpScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite
  platforms!: Phaser.Physics.Arcade.StaticGroup
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  score = 0
  scoreText!: Phaser.GameObjects.Text
  alive = false

  // 永远可用的总线
  public bus = new Phaser.Events.EventEmitter()

  constructor() { super('JumpScene') }

  preload() {
    this.load.image('ground', 'https://i.imgur.com/WP7xS3S.png')
    this.load.image('player', 'https://i.imgur.com/T5q0k7y.png')
  }

  create() {
    const w = this.scale.width, h = this.scale.height
    this.platforms = this.physics.add.staticGroup()
    this.platforms.create(w/2, h-20, 'ground').setScale(0.5).refreshBody()

    this.player = this.physics.add.sprite(w/2, h-60, 'player')
      .setBounce(0.2).setCollideWorldBounds(true)
    this.physics.add.collider(this.player, this.platforms)

    this.cursors = this.input.keyboard!.createCursorKeys()
    this.scoreText = this.add.text(12, 12, 'Score: 0', { fontSize:'18px', color:'#fff' })

    this.start()
    this.bus.emit('ready')
  }

  start() {
    this.score = 0
    this.alive = true
    this.player.setPosition(this.scale.width/2, this.scale.height-60).setVelocity(0,-250)
  }

  revive() {
    this.alive = true
    this.player.setVelocity(0,-300)
  }

  update(_t:number, d:number) {
    if (!this.alive) return
    if (this.cursors.left?.isDown) this.player.setVelocityX(-160)
    else if (this.cursors.right?.isDown) this.player.setVelocityX(160)
    else this.player.setVelocityX(0)

    this.score += d * 0.01
    this.scoreText.setText('Score: ' + Math.floor(this.score))

    if (this.player.y > this.scale.height + 10) {
      this.alive = false
      this.bus.emit('gameover', Math.floor(this.score))
    }
  }
}
