'use strict';

var _ = require('underscore');
var Enemy = require('../elements/enemy');
var levelConfigs = require('./levels');
var ActionList = require('../elements/actionlist');
var ActionLists = require('../elements/actionlists');
var ReaderAction = require('../elements/actions/reader');
var WaitAction = require('../elements/actions/wait');

module.exports = Play;

function Play() {}

Play.prototype = {
  init: function (levelId) {
    this.levelId = levelId || 0;
    this.levelConfig = levelConfigs[this.levelId % levelConfigs.length];
  },
  preload: function () {
    this.game.load.image('background', 'assets/' + this.levelConfig.background);
  },
  create: function() {
    this.background = this.game.add.sprite(0, 0, 'background');
    
    this.enemyGroup = this.game.add.group();
    _.each(this.levelConfig.targets, function (conf) {
      var enemy = new Enemy(this.game, this.game.width * conf.x, this.game.height * conf.y)
      this.game.add.existing(enemy);
      enemy.inputEnabled = true;
      //enemy.input.pixelPerfectOver = true;
      //enemy.events.onInputDown.add(this.enemyShot, this, enemy);
      this.enemyGroup.add(enemy);
    }.bind(this));
    this.enemyGroup.sort('y', Phaser.Group.SORT_ASCENDING); // higher up is farther back
    //
    this.crosshair = this.game.add.sprite(0, 0, 'crosshair');
    this.crosshair.anchor.setTo(0.5, 0.5);
    this.shotCountdown = 0;
    this.shotDelay = 0.5;
    //
    this.scoreBlips = this.game.add.group();
    //
    this.winTriggered = false;
    //
    this.commandText = this.game.add.text(this.game.width * 0.5, this.game.height * 0.2, '', {
      font: '24px Arial',
      fill: 'white',
      align: 'center'
    });
    this.commandText.anchor.setTo(0.5, 0.5);
    //
    this.allowedToShoot = false;
    this.createScripts();
  },
  createScripts: function () {
    this.actionLists = new ActionLists({
      'start': new ActionList(this.game, [
        new ReaderAction({
          textObject: this.commandText,
          lines: [
            'Ready', 'Aim'
          ]
        }),
        {
          start: function () {
            this.gameState.allowedToShoot = true;
            this.actionList.next();
          }
        },
        new ReaderAction({
          textObject: this.commandText,
          lines: [
            'Fire'
          ]
        }),
        new WaitAction(5),
        {
          start: function () {
            this.gameState.actionLists.start('hurryUp');
          }
        }
      ]),
      'hurryUp': new ActionList(this.game, [
        new ReaderAction({
          textObject: this.commandText,
          lines: [
            'Do it now',
            'Shoot the prisoner or you\'re next'
          ]
        }),
        new WaitAction(5),
        {
          start: function () {
            this.gameState.onLose('You were executed for disobeying orders.');
          }
        }
      ])
    });
    this.actionLists.start('start');
  },

  update: function() {
    var dt = this.game.time.physicsElapsed;
    var pointer = this.game.input.activePointer;

    this.crosshair.position.setTo(pointer.x, pointer.y);
    this.shotCountdown -= dt;
    if (this.shotCountdown <= 0 && pointer.isDown) {
      this.game.sound.play('shoot', 1.0, false, false);
      this.shotCountdown = this.shotDelay;
      var hitEnemy;
      // enemies are sorted back to front
      for (var i = this.enemyGroup.length - 1; i >= 0; i--) {
        var enemy = this.enemyGroup.children[i];
        if (!enemy.alive || !enemy.exists) {
          continue;
        }
        if (enemy.input.checkPointerDown(pointer)) {
          hitEnemy = enemy;
          break;
        }    
      }
      if (hitEnemy) {
        this.enemyShot(hitEnemy);
      }
      // if (!this.allowedToShoot) {
      //   this.onLose('You were executed for shooting too early.');
      // }
    }
    if (!this.winTriggered && this.enemyGroup.countLiving() == 0) {
      this.onWin();
    }
    this.actionLists.update();
  },
  enemyShot: function(enemy) {
    if (enemy.isDying) {
      return;
    }
    enemy.isDying = true;
    enemy.play('die', 30);
    this.createScoreBlip(enemy.x, enemy.y - enemy.height * enemy.anchor.y, '+100');
  },
  createScoreBlip: function (x, y, value) {
    var blip = this.scoreBlips.getFirstExists(false);
    if (blip) {
      blip.revive();
      blip.reset(x, y);
      blip.text = value;
      blip.alpha = 1.0;
    } else {
      blip = this.game.add.text(x, y, value, {
        font: '32px Arial',
        fill: 'white',
        align: 'center'
      });
      blip.anchor.setTo(0.5, 0.5);
      this.scoreBlips.add(blip);
    }
    var tween = this.game.add.tween(blip).to(
      {alpha: 0, y: y - 50}, 750, Phaser.Easing.Cubic.In, true, 0
    )
    tween.onComplete.add(function () {
      blip.kill();
    });
  },
  onWin: function () {
    this.winTriggered = true;
    setTimeout(this.startNextLevel.bind(this), 2000);
  },
  onLose: function (reason) {
    this.game.state.start('gameover', true, false, reason);
  },
  startNextLevel: function () {
    var nextId = this.levelId + 1;
    this.game.state.start('play', true, false, nextId)
  }
};
