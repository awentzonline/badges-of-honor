'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    this.asset = this.add.sprite(this.game.width/2,this.game.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.spritesheet('soldier', 'assets/soldier_fall.png', 61, 200, 15);
    this.load.image('crosshair', 'assets/crosshair.png');
    this.load.image('bloodsplat', 'assets/bloodsplat.png');
    this.load.image('m16ammo', 'assets/m16ammo.png');
    this.load.image('badge', 'assets/badge.png');
    this.load.image('shade', 'assets/shade.png');
    this.load.audio('shoot', ['assets/ar15.m4a', 'assets/ar15.ogg']);
    this.load.audio('hit', 'assets/hit.wav');
    this.load.audio('select', 'assets/select.wav');
    this.load.audio('achievement', 'assets/achievement.wav');
    this.game.load.bitmapFont('dday', 'assets/font.png', 'assets/font.fnt');
  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready) {
      this.game.state.start('play');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;
