'use strict';

module.exports = WaitAction;

function WaitAction(time) {
  this.time = time;
}

WaitAction.prototype = {
  start: function () {
    this.countdown = this.time;
  },
  update: function () {
    this.countdown -= this.game.time.physicsElapsed;
    if (this.countdown <= 0) {
      this.actionList.next();
    }
  }
};
