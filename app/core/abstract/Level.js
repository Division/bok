var Events = require('Events');
var Engine = require('Engine');
var Class = require('Class');
var GameObject = require('./GameObject');
/**
 * Load base level object
 *
 * @class Level
 * @name Level
 */
module.exports = Class.extend([Events], {

    /**
     * Init plugin instance
     *
     * @constructor
     *
     * @param {HTMLElement|String} el
     */
    initialize: function(el){

        // Here we will store loaded game objects
        this.gameObjects = [];

        this.engine = new Engine(el);
        this.game = this.engine.createGame();

        // Listen preload event
        this.listenTo(this.game, 'preload', this.preload);
        this.listenTo(this.game, 'create', this.create);
    },

    /**
     * Load game object to level
     *
     * @param {GameObject} GameObject
     */
    add: function(GameObject){

        var gameObject = new GameObject(this.game);

        if (gameObject.preload) gameObject.preload();

        gameObject.listenTo(this.game, 'create', gameObject.beforeCreate);

        this.game.plugins.add(gameObject);
        this.gameObjects.push(gameObject);

        return gameObject;
    },

    /**
     * Stub for preload method
     */
    preload: function(){
        console.warn('Preload not defined');
    },

    /**
     * Stub for create method
     */
    create: function(){
        console.warn('Create not defined');
    }

});
