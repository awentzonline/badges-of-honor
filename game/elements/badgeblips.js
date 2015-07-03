'use strict';

module.exports = BadgeBlips;

function BadgeBlips() {
  Phaser.Group.apply(this, arguments);
}

BadgeBlips.prototype = Object.create(Phaser.Group.prototype);
BadgeBlips.prototype.constructor = BadgeBlips;

BadgeBlips.prototype.addBlip = function(x, y, body, duration, font, size) {
  var blip = this.getFirstExists(false);
  if (blip) {
    blip.revive();
    blip.reset(x, y);
    blip.bitmapText.text = body;
    blip.alpha = 1.0;
  } else {
    blip = new BadgeBlip(this.game, x, y, font, size);
    blip.bitmapText.text = body;
    this.add(blip);
  }
  blip.scale.setTo(0.3, 0.3);
  var scaleTween = this.game.add.tween(blip.scale).to(
    {x:1.0, y:1.0}, 250, Phaser.Easing.Elastic.Out, true, 0
  );
  var tween = this.game.add.tween(blip.scale).to(
    {x:0, y:0}, 250, Phaser.Easing.Elastic.In, false, duration
  );
  scaleTween.chain(tween);
  tween.onComplete.add(function () {
    blip.kill();
  });
};

function BadgeBlip(game, x, y, font, size) {
  Phaser.Sprite.call(this, game, x, y);
  this.badge = this.game.add.sprite(0, 0, 'badge');
  this.badge.anchor.setTo(0.5, 0.5);
  this.badge.alpha = 0.9;
  this.addChild(this.badge);
  this.bitmapText = this.game.add.bitmapText(0, 0, font, '', size);
  this.bitmapText.anchor.setTo(0.5, 0.7);
  this.addChild(this.bitmapText);
  this.anchor.setTo(0.5, 0.5);
}

BadgeBlip.prototype = Object.create(Phaser.Sprite.prototype);
BadgeBlip.prototype.constructor = BadgeBlip;
