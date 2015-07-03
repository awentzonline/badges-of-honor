'use strict';

module.exports = Bloodsplosion;

function Bloodsplosion() {
  Phaser.Group.apply(this, arguments);
  this.bloodEmitter = this.game.add.emitter(0, 0, 100);
  this.bloodEmitter.makeParticles('bloodsplat');
  this.bloodEmitter.gravity = 600;
  this.bloodEmitter.setAlpha(0.5, 0, 1000);
  this.bloodEmitter.setRotation(0, 0);
  this.add(this.bloodEmitter);
}

Bloodsplosion.prototype = Object.create(Phaser.Group.prototype);
Bloodsplosion.prototype.constructor = Bloodsplosion;

Bloodsplosion.prototype.burst = function (x, y) {
  this.bloodEmitter.x = x;
  this.bloodEmitter.y = y;
  this.bloodEmitter.start(true, 500, null, 3);
};
