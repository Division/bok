var Phaser = require('phaser');
var Events = require('Events');
var Class = require('Class');
var _ = require('lodash');
var VerletPhysics = require('./modules/verlet-physics/VerletPhysics');

/**
 * Main engine class
 *
 * @extend {Events}
 *
 * @class Engine
 * @name Engine
 */
module.exports = Class.extend([Events], {

    /**
     * Default renderer, if debug ON will be switched to CANVAS
     */
    renderer: Phaser.AUTO,

    /**
     * Enable engine debug
     */
    debug: true,

    /**
     * Enable performance monitor
     */
    debugPerformanceMonitor: true,

    /**
    * The width of your game in game pixels.
    * If given as a string the value must be between 0 and 100 and will be used as the percentage width
    * of the parent container, or the browser window if no parent is given
    *
    * @type {Number|String}
    */
    width: "100", // 100%

    /**
    * The height  of your game in game pixels.
    * If given as a string the value must be between 0 and 100 and will be used as the percentage width
    * of the parent container, or the browser window if no parent is given
    *
    * @type {Number|String}
    */
    height: "100", // 100%

    /**
    * This is where the magic happens. The Game object is the heart of your game, providing quick access to common
    * functions and handling the boot process.
    *
    * @type {Phaser.Game}
    */
    game: null,

    /**
     * Init object
     *
     * @constructor
     */
    initialize: function(){

        // Make phaser accessible global, this is not good practice, but I don't give a fuck!
        window.Phaser = Phaser;
        window.Point = Phaser.Point;
    },

    /**
     * Start game level
     */
    createGame: function() {

        // Initialize optional modules
        Phaser.PluginManager = require('./modules/core/PluginManager');
        Phaser.Keyboard = require('./modules/input/Keyboard');

        // Initialize debug module
        if(this.debug) {
            Phaser.Utils.Debug = require('./modules/debug/Engine');
            Phaser.BitmapData = require('./modules/gameobjects/BitmapData');
            this.renderer = Phaser.CANVAS; // Debug not works for WebGL render
        }

        // Create game object
        this.game =  _.extend(new Phaser.Game(this.width, this.height, this.renderer, this.element, {
            preload: this.preload.bind(this),
            create:  this.create.bind(this)
        }), Events);

        this.game.isDebugEnabled = this.debug;

        return this.game;
    },

    /**
     * Preload is called first. Normally you'd use this to load your game assets (or those needed for the current State)
     * You shouldn't create any objects in this method that require assets that you're also loading in this method, as
     * they won't yet be available.
     */
    preload: function(){

        if (this.debugPerformanceMonitor){
            this.game.plugins.add(require('./modules/debug/Performance'));
        }

        this.game.trigger('preload');

    },

    /**
     * Create is called once preload has completed, this includes the loading of any assets from the Loader.
     * If you don't have a preload method then create is the first method called in your State.
     */
    create: function(){

        //  Enable physics
        window.VerletPhysics = new VerletPhysics(this.game);
        this.game.plugins.add(window.VerletPhysics);
        this.game.trigger('create');
    }

});

