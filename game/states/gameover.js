
'use strict';
function GameOver() {}

GameOver.prototype = {
  init: function (reason) {
    this.reason = reason || '';
  },
  preload: function () {

  },
  create: function () {
    this.titleText = this.game.add.bitmapText(this.game.world.centerX, 100, 'dday', 'Executed!', 64);
    this.titleText.anchor.setTo(0.5, 0.5);

    if (this.reason) {
      this.congratsText = this.game.add.bitmapText(
        this.game.world.centerX, 200, 'dday', this.reason, 24
      );
      this.congratsText.anchor.setTo(0.5, 0.5);
    }
    this.instructionText = this.game.add.bitmapText(
      this.game.world.centerX, 300, 'dday', 'Click To Re-enlist', 32
    );
    this.instructionText.anchor.setTo(0.5, 0.5);

    this.game.score = 0;
  },
  update: function () {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};
module.exports = GameOver;
