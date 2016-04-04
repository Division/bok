/**
 * Created by Nikita Sidorenko on 3/13/16.
 */
var Class = require("Class");
var Events = require("Events");

/**
 * @class BaseEntity
 */
module.exports = Class.extend([Events], {

    engine: null,
    game: null,
    physics: null,
    mustBeKilled: false,

    setup: function(game, engine) {
        this.game = game;
        this.engine = engine;
        this.physics = engine.physics;
    },

    destroy: function() {
        this.mustBeKilled = true;
    },

    start: function() {

    },

    update: function() {

    },

    render: function() {

    }

});
