var GameObject = require('GameObject');
var KeyCodes = require('KeyCodes');

// Shortcuts
var game, ship, speed = 0;

/**
 * Player represent player objects
 *
 * @name Player
 * @class Player
 */
module.exports = GameObject.extend({

    /**
     * Ship sprite
     *
     * @type {Phaser.Sprite}
     */
    ship: null,

    /**
     * Preload is called first. Normally you'd use this to load your game assets (or those needed for the current State)
     * You shouldn't create any objects in this method that require assets that you're also loading in this method, as
     * they won't yet be available.
     */
    preload: function(){

        game = this.game;

        game.load.image('ship', 'assets/general/ship.png');
    },

    /**
     * Create is called once preload has completed, this includes the loading of any assets from the Loader.
     * If you don't have a preload method then create is the first method called in your State.
     */
    create: function(){

        // Add ship to stage
        ship = this.ship = game.add.sprite(game.world.centerX, game.world.centerY, 'ship');
        ship.anchor.set(0.5);

        // Add physics
        game.physics.enable(ship, Phaser.Physics.ARCADE);

        // Setup physics
        ship.body.drag.set(0);
        ship.body.maxVelocity.set(200);

        // Camera setup
        //game.camera.follow(ship, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
    },

    /**
     * Update is called after all the core subsystems (Input, Tweens, Sound, etc) and the State have updated,
     * but before the render. It is only called if active is set to true.
     */
    update: function(){

        ship.rotation = game.physics.arcade.angleToPointer(ship);

        if(game.input.keyboard.isDown(KeyCodes.SPACEBAR)){
            speed += 5;

            speed = Math.min(speed, 150);

            game.physics.arcade.accelerationFromRotation(ship.rotation, speed, ship.body.acceleration);
        }else{
            speed = 0;
            ship.body.acceleration.set(0);
        }

    },

    /**
     * Render is called right after the Game Renderer completes,
     * but before the State.render. It is only called if visible is set to true.
     */
    render: function(){

        if(game.isDebugEnabled){
            game.debug.spriteInfo(ship, 32, 32);
            game.debug.bodyInfo(ship, 400, 32);
            game.debug.body(ship);
            game.debug.cameraInfo(game.camera, 32, 120);
        }
    }

});
