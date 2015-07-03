'use strict';

var _ = require('underscore');
var Blips = require('../elements/blips');
var Bloodsplosion = require('../elements/bloodsplosion');
var Crosshair = require('../elements/crosshair');
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
    this.game.score = this.game.score || 0;
  },
  preload: function () {
    this.game.load.image('background', 'assets/' + this.levelConfig.background);
  },
  create: function() {
    this.background = this.game.add.sprite(0, 0, 'background');
    // splatter
    this.bloodsplosion = new Bloodsplosion(this.game);
    // enemies
    this.enemyGroup = this.game.add.group();
    _.each(this.levelConfig.targets, function (conf) {
      var enemy = new Enemy(this.game, this.game.width * conf.x, this.game.height * conf.y)
      this.game.add.existing(enemy);
      enemy.inputEnabled = true;
      enemy.input.pixelPerfectClick = true;
      this.enemyGroup.add(enemy);
    }.bind(this));
    this.enemyGroup.sort('y', Phaser.Group.SORT_ASCENDING); // higher up is farther back
    //
    this.shotCountdown = 0;
    this.shotDelay = 0.2;
    this.shootSound = this.game.add.audio('shoot');
    //
    this.scoreBlips = new Blips(this.game);
    this.game.add.existing(this.scoreBlips)
    //
    this.winTriggered = false;
    //
    this.commandText = this.game.add.bitmapText(this.game.width * 0.5, this.game.height * 0.2, 'dday', '', 36);
    this.commandText.anchor.setTo(0.5, 0);
    // score
    this.interpScore = this.game.score;
    this.scoreText = this.game.add.bitmapText(this.game.width * 0.5, this.game.height * 0.1, 'dday', '' + this.interpScore, 42);
    this.scoreText.anchor.setTo(0.5, 0.5);
    //
    this.crosshair = new Crosshair(this.game, 0, 0);
    this.game.add.existing(this.crosshair);
    //
    this.createScripts();
  },
  createScripts: function () {
    this.actionLists = new ActionLists({
      'start': new ActionList(this.game, [
        new ReaderAction({
          textObject: this.commandText,
          lines: [
            'Ready', 'Aim', 'Fire'
          ]
        }),
        new WaitAction(5),
        {
          start: function () {
            this.gameState.actionLists.start('hurryUp');
          }
        }
      ]),
      'getSome': new ActionList(this.game, [
        new ReaderAction({
          textObject: this.commandText,
          randomLines: [
            [
              'You deserve a promotion!'
            ],
            [
              'Nice shot!'
            ],
            [
              'What a shot!'
            ]
          ]
        }),
        new WaitAction(5),
        {
          start: function () {
            if (!this.winTriggered) {
              this.gameState.actionLists.start('hurryUp');
            }
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
      ]),
      'goodGame': new ActionList(this.game, [
        new ReaderAction({
          textObject: this.commandText,
          randomLines: [
            ['Good Job\nLevel Complete'],
            ['Great shooting, soldier\nGet ready for the next level']
          ]
        }),
        {
          start: function () {
            this.startNextLevel();
          }.bind(this)
        }
      ])
    });
    this.actionLists.start('start');
  },

  update: function() {
    var dt = this.game.time.physicsElapsed;
    var pointer = this.game.input.activePointer;
    this.shotCountdown -= dt;
    if (this.shotCountdown <= 0 && pointer.isDown) {
      //this.game.sound.play('shoot', 1.0, false, true);
      this.shootSound.play();
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
        this.bloodsplosion.burst(pointer.x, pointer.y);
      }
    }
    if (!this.winTriggered && this.enemyGroup.countLiving() == 0) {
      this.onWin();
    }
    this.actionLists.update();
    this.updateScoreboard();
  },
  updateScoreboard: function () {
    var ds = this.game.score - this.interpScore;
    if (Math.abs(ds) > 0) {
      this.interpScore += Math.max(1, ds * 0.2);
      this.interpScore = Math.min(this.interpScore, this.game.score);
      this.scoreText.text = '' + Math.floor(this.interpScore);
    }
  },
  enemyShot: function(enemy) {
    if (enemy.isDying) {
      return;
    }
    if ((this.enemyGroup.countDead()) % 2) {
      this.actionLists.start('getSome');
    }
    enemy.isDying = true;
    enemy.play('die', 30);
    var scoreValue = 100;
    this.game.score += scoreValue;
    this.scoreBlips.addBlip(
      enemy.x, enemy.y - enemy.height * enemy.anchor.y,
      '+' + scoreValue,
      this.game.width * 0.5, this.scoreText.y,
      750, 'dday', 36
    );
  },
  onWin: function () {
    this.winTriggered = true;
    this.actionLists.start('goodGame');
  },
  onLose: function (reason) {
    if (!this.winTriggered) {
      this.game.state.start('gameover', true, false, reason);
    }
  },
  startNextLevel: function () {
    var nextId = this.levelId + 1;
    this.game.state.start('play', true, false, nextId)
  }
};
