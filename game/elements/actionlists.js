'use strict';

module.exports = ActionLists;

function ActionLists(actionLists) {
  this.actionLists = actionLists;
  this.actionList = null;
}

ActionLists.prototype = {
  start: function (name) {
    if (this.actionList) {
      this.actionList.stop();
    }
    this.actionList = this.actionLists[name];
    this.actionList.start();
  },
  stop: function (name) {
    if (this.actionList) {
      this.actionList.stop();
    }
  },
  update: function () {
    if (this.actionList) {
      this.actionList.update();
    }
  }
};
