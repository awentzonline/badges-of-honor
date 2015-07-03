'use strict';

module.exports = ReaderAction;

function ReaderAction(options) {
  this.textObject = options.textObject;
  this.randomLines = options.randomLines;
  this.lines = options.lines;
  this.displayTime = options.displayTime || 1000;
  this.hideTime = options.hideTime || 500;
}

ReaderAction.prototype = {
  start: function () {
    this.lineIndex = -1;
    this.tween = null;
    this.textObject.alpha = 0.0;
    if (this.randomLines) {
      this.lines = this.randomLines[Math.floor(Math.random() * this.randomLines.length)];
    }
    this.nextText();
  },
  nextText: function () {
    this.lineIndex++;
    if (this.lines.length <= this.lineIndex) {
      this.actionList.next();
      return;
    }
    var line = this.lines[this.lineIndex];
    this.textObject.text = line;
    this.tween = this.game.add.tween(this.textObject).to({alpha: 1.0}, this.hideTime, Phaser.Easing.Linear.None, true);
    this.tween.onComplete.addOnce(function () {
      this.tween = this.game.add.tween(this.textObject).to({alpha: 0.0}, this.hideTime, Phaser.Easing.Linear.None, true, this.displayTime);
      this.tween.onComplete.addOnce(function () {
        this.nextText();
      }, this);
    }, this);
  },
  stop: function () {
    if (this.tween) {
      this.tween.stop();
      this.game.tweens.remove(this.tween);
      this.tween = null;
    }
  }
}