'use strict';

var Crosshair = require('../elements/crosshair');

function JobAssignment() {}

JobAssignment.prototype = {
  preload: function() {

  },
  create: function() {
    this.titleText = this.game.add.bitmapText(
      this.game.world.centerX, this.game.height * 0.2, 'dday', 'Operational Assignment', 42
    );
    this.titleText.anchor.setTo(0.5, 0.5);

    this.instructionsText = this.game.add.bitmapText(
      this.game.world.centerX, this.game.height * 0.3, 'dday', 'You\'re in the army now, hotshot\nLet\'s get you an assignment', 28
    );
    this.instructionsText.anchor.setTo(0.5, 0.5);

    this.crosshair = new Crosshair(this.game, 0, 0);
    this.game.add.existing(this.crosshair);

    this.assignmentText = this.game.add.bitmapText(
      this.game.world.centerX, this.game.height * 0.5, 'dday', '', 32
    );
    this.assignmentText.anchor.setTo(0.5, 0.5);
    
    this.assigned = false;
    this.assignmentCountdown = 4.0;
    this.assChangeCountdown = 0;
  },
  update: function() {
    var pointer = this.game.input.activePointer;
    var dt = this.game.time.physicsElapsed;
    this.assignmentCountdown -= dt;
    if (this.assignmentCountdown < 0) {
      if (!this.assigned) {
        this.assignmentText.text = 'Executioner';
        this.assigned = true;
        var tween = this.game.add.tween(this.assignmentText.scale).to(
          {x:2, y:2}, 1000, Phaser.Easing.Elastic.Out, true, 0
        );
      }
      if(this.assignmentCountdown < -2) { //pointer && pointer.justPressed()) {
        this.game.sound.play('shoot');
        this.game.state.start('play', true, false, 0);
      }
    } else {
      this.assChangeCountdown -= dt;
      if (this.assChangeCountdown <= 0) {
        this.assignmentText.text = assignments[Math.floor(Math.random() * assignments.length)];
        this.assChangeCountdown = 0.1;
      }
    }
  }
};

var assignments = [
  'Sniper', 'Rifleman', 'Spy', 'General', 'Tanker', 'Arms Specialist', 'Special Ops',
  'Pilot', 'Radioman', 'Medic', 'Mortar', 'Cook', 'Executioner', 'Computer Programmer',
  'Intelligence Analyst', 'The President', 'Armory Attendant', 'Drone Pilot',
  'Submarine Commander'
];

module.exports = JobAssignment;
