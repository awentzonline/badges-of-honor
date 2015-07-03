'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(400, 600, Phaser.AUTO, 'badges-of-honor');

  // Game States
  game.state.add('achievements', require('./states/achievements'));
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('levels', require('./states/levels'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('boot');
};