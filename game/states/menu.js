'use strict';

var Crosshair = require('../elements/crosshair');

function Menu() {}

Menu.prototype = {
  preload: function() {

  },
  create: function() {
    var style = { font: '45px Arial', fill: '#ffffff', align: 'center'};
    this.titleText = this.game.add.text(this.game.world.centerX, 300, 'War Hero\nThe Game!', style);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.instructionsText = this.game.add.text(this.game.world.centerX, 400, 'Click to play', { font: '16px Arial', fill: '#ffffff', align: 'center'});
    this.instructionsText.anchor.setTo(0.5, 0.5);

    this.crosshair = new Crosshair(this.game, 0, 0);
    this.game.add.existing(this.crosshair);
  },
  update: function() {
    var pointer = this.game.input.activePointer;
    if(pointer && pointer.justPressed()) {
      this.game.state.start('play', true, false, 0);
    }
  }
};

module.exports = Menu;
