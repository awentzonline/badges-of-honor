'use strict';

var Crosshair = require('../elements/crosshair');

function JobAssignment() {}

JobAssignment.prototype = {
  preload: function() {

  },
  create: function() {
    this.titleText = this.game.add.bitmapText(
      this.game.world.centerX, 300, 'dday', 'Operational Assignment', 64
    );
    this.titleText.anchor.setTo(0.5, 0.5);

    this.instructionsText = this.game.add.bitmapText(
      this.game.world.centerX, 400, 'dday', '', 28
    );
    this.instructionsText.anchor.setTo(0.5, 0.5);

    this.crosshair = new Crosshair(this.game, 0, 0);
    this.game.add.existing(this.crosshair);
  },
  update: function() {
    var pointer = this.game.input.activePointer;
    if(pointer && pointer.justPressed()) {
      this.game.sound.play('shoot')
      this.game.state.start('play', true, false, 0);
    }
  }
};

module.exports = JobAssignment;
