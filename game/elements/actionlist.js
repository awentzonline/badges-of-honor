'use strict';

module.exports = ActionList;

function ActionList(game, actions) {
  this.game = game;
  this.actions = actions;
  this.action = null;
  this.actionIndex = -1;
}

ActionList.prototype = {
  update: function () {
    if (this.action && this.action.update) {
      this.action.update();
    }
  },
  start: function () {
    this.actionIndex = -1;
    this.next();
  },
  stop: function () {
    if (this.action && this.action.stop) {
      this.action.stop();
    }
  },
  next: function () {
    if (this.action && this.action.stop) {
      this.action.stop();
    }
    this.actionIndex++;
    this.action = this.actions[this.actionIndex];
    if (this.action) {
      this.action.game = this.game;  // I'm lazy
      this.action.gameState = this.game.state.states[this.game.state.current];
      this.action.actionList = this;
      if (this.action.start) {
        this.action.start();
      }
    }
  }

};
