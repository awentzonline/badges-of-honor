'use strict';

module.exports = Crosshair;

function Crosshair(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'crosshair');
  this.anchor.setTo(0.5, 0.5);  
}

Crosshair.prototype = Object.create(Phaser.Sprite.prototype);
Crosshair.prototype.constructor = Crosshair;

Crosshair.prototype.update = function () {
  Phaser.Sprite.prototype.update.call(this);
  var pointer = this.game.input.activePointer;
  if (pointer.withinGame) {
    this.position.setTo(pointer.x, pointer.y);
  }
};
