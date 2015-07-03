
module.exports = Enemy;

function Enemy(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'soldier');
  this.anchor.setTo(0.5, 0.9);
  this.animations.add('idle', [0]);
  var deathAnim = this.animations.add('die', [1,2,3,4,5,6,7,8,9,10,11,12,13]);
  deathAnim.onComplete.add(function () {
    game.sound.play('hit', 1.0, false);
    this.kill();
    this.visible = true;
    this.exists = true;
  }.bind(this));
  this.isDying = false;
}

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;
