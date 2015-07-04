'use strict';

var _ = require('underscore');
var achievementList = require('../boh/achievements');
var BadgeBlips = require('../elements/badgeblips');
var Blips = require('../elements/blips');
var Bloodsplosion = require('../elements/bloodsplosion');
var Crosshair = require('../elements/crosshair');
var Enemy = require('../elements/enemy');
var levelConfigs = require('../boh/levels');
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
    this.nextAchievementIndex = this.findNextAchievementIndex();
  },
  preload: function () {
    this.game.load.image('background', 'assets/' + this.levelConfig.background);
  },
  create: function() {
    this.background = this.game.add.sprite(0, 0, 'background');
    this.shade = this.game.add.sprite(0, -90, 'shade');
    //this.shade.alpha = 0.75;
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
    this.shotDelay = 0.1;
    //this.shootSound = this.game.add.audio('shoot');
    //
    this.numBullets = 20;
    this.bulletType = this.game.add.sprite(this.game.width * 0.85, this.game.height * 0.95, 'm16ammo');
    this.bulletType.anchor.setTo(0.6, 0.7);
    this.bulletText = this.game.add.bitmapText(this.game.width * 0.85, this.game.height * 0.95, 'dday', '', 28);
    this.bulletText.text = this.numBullets;
    this.bulletText.anchor.setTo(0.5, 0.5);
    this.outOfBullets = false;
    //
    this.scoreBlips = new Blips(this.game);
    this.game.add.existing(this.scoreBlips)
    //
    this.winTriggered = false;
    //
    this.commandText = this.game.add.bitmapText(this.game.width * 0.5, this.game.height * 0.125, 'dday', '', 36);
    this.commandText.anchor.setTo(0.5, 0);
    //
    this.interpScore = this.game.score;
    this.scoreText = this.game.add.bitmapText(this.game.width * 0.5, this.game.height * 0.075, 'dday', '', 42);
    this.scoreText.anchor.setTo(0.5, 0.5);
    this.scoreText.text = this.interpScore;
    //
    this.crosshair = new Crosshair(this.game, 0, 0);
    this.game.add.existing(this.crosshair);
    //
    this.createScripts();
    //
    this.badgeBlips = new BadgeBlips(this.game);
    this.game.add.existing(this.badgeBlips);
    if (this.levelId == 0) {
      this.showBadgeBlip('Enlistment\n   Bonus')
    } else {
      if (this.levelId % levelConfigs.length == 0) {
        this.showBadgeBlip('Prestige!');
      }
    }
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
            ],
            [
              'Get some!'
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
        {
          start: function () {
            this.gameState.showBadgeBlip('POTENTIAL\n PACIFIST')
            this.actionList.next();
          }
        },
        new ReaderAction({
          textObject: this.commandText,
          lines: [
            'Pull the fucking trigger',
            'Shoot the prisoner\nor you are next',
            'You are disobeying\na direct order'
          ]
        }),
        new WaitAction(5),
        new ReaderAction({
          textObject: this.commandText,
          lines: [
            'Arrest him'
          ]
        }),
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
            ['Great shooting, soldier\nGet ready for the next level'],
            ['The President says good job\nPrepare for the next level']
          ]
        }),
        {
          start: function () {
            this.startNextLevel();
          }.bind(this)
        }
      ]),
      'outOfBullets': new ActionList(this.game,[
        {
          start: function () {
            this.gameState.showBadgeBlip(' WASTER OF\nTAX DOLLARS');
            this.actionList.next();
          }
        },
        new ReaderAction({
          textObject: this.commandText,
          lines: [
            'You wasted all of your ammo',
            'The President is livid'
          ]
        }),
        new WaitAction(1),
        {
          start: function () {
            this.game.score = 0;
            this.game.state.start('play');
          }
        }
      ])
    });
    this.actionLists.start('start');
  },

  update: function() {
    var dt = this.game.time.physicsElapsed;
    var pointer = this.game.input.activePointer;
    this.shotCountdown -= dt;
    if (this.shotCountdown <= 0 && pointer.isDown && this.numBullets > 0) {
      this.numBullets -= 1;
      this.bulletText.text = this.numBullets;
      this.game.sound.play('shoot', 1.0, false, true);
      //this.shootSound.play();
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
    // TODO: improve this 'alive' situation
    var allEnemyDying = true;
    this.enemyGroup.forEachAlive(function (e) { allEnemyDying &= e.isDying; })
    if (!this.winTriggered && allEnemyDying) {
      this.onWin();
    }
    if (this.numBullets <= 0 && !this.winTriggered && !this.outOfBullets) {
      this.outOfBullets = true;
      this.actionLists.start('outOfBullets');
    }
    this.actionLists.update();
    this.updateScoreboard();
    this.updateAchievements();
  },
  updateScoreboard: function () {
    var ds = this.game.score - this.interpScore;
    if (Math.abs(ds) > 0) {
      this.interpScore += Math.max(1, ds * 0.2);
      this.interpScore = Math.min(this.interpScore, this.game.score);
      this.scoreText.text = Math.floor(this.interpScore);
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
  },
  findNextAchievementIndex: function () {
    for (var i = 0; i < achievementList.length; i++) {
      var achievement = achievementList[i];
      if (achievement) {
        var score = achievement[0];
        if (score > this.game.score) {
          return i;
        }
      }
    }
    return -1;
  },
  updateAchievements: function () {
    var nextAchievement = achievementList[this.nextAchievementIndex];
    if (nextAchievement) {
      var score = nextAchievement[0];
      var text = nextAchievement[1];
      if (this.game.score >= score) {
        this.showBadgeBlip(text);
        this.nextAchievementIndex++;
      }
    }
  },
  showBadgeBlip: function (text) {
    this.game.sound.play('achievement', 0.5);
    this.badgeBlips.addBlip(
      this.game.width * 0.275, this.game.height * 0.85, text, 1000, 'dday', 42
    );
  }
};
