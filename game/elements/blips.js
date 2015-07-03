'use strict';

module.exports = Blips;

function Blips() {
  Phaser.Group.apply(this, arguments);
}

Blips.prototype = Object.create(Phaser.Group.prototype);
Blips.prototype.constructor = Blips;

Blips.prototype.addBlip = function(x, y, body, endX, endY, duration, font, size) {
  var blip = this.getFirstExists(false);
  endX = endX === undefined ? x : endX;
  endY = endY === undefined ? 0 : endY;
  if (blip) {
    blip.revive();
    blip.reset(x, y);
    blip.text = body;
    blip.alpha = 1.0;
  } else {
    blip = this.game.add.bitmapText(x, y, font, body, size);
    blip.anchor.setTo(0.5, 0.7);
    this.add(blip);
  }
  var tween = this.game.add.tween(blip).to(
    {alpha: 0, x: endX, y: endY}, duration, Phaser.Easing.Cubic.In, true, 0
  )
  tween.onComplete.add(function () {
    blip.kill();
  });
};