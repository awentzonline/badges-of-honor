
'use strict';
function GameOver() {}

GameOver.prototype = {
  init: function (reason) {
    this.reason = reason || '';
  },
  preload: function () {

  },
  create: function () {
    var style = { font: '45px Arial', fill: '#ffffff', align: 'center'};
    this.titleText = this.game.add.text(this.game.world.centerX,100, 'Executed!', style);
    this.titleText.anchor.setTo(0.5, 0.5);

    if (this.reason) {
      this.congratsText = this.game.add.text(this.game.world.centerX, 200, this.reason, { font: '16px Arial', fill: '#ffffff', align: 'left'});
      this.congratsText.anchor.setTo(0.5, 0.5);
    }
    this.instructionText = this.game.add.text(this.game.world.centerX, 300, 'Click To Play Again', { font: '16px Arial', fill: '#ffffff', align: 'center'});
    this.instructionText.anchor.setTo(0.5, 0.5);
  },
  update: function () {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};
module.exports = GameOver;
