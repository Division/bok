/**
 * Created by Nikita Sidorenko on 3/13/16.
 */
var Class = require("Class");

/**
 * @class BaseEntity
 */
module.exports = Class.extend({

    engine: null,
    game: null,
    physics: null,

    setup: function(game, engine) {
        this.game = game;
        this.engine = engine;
        this.physics = engine.physics;
    },

    destroy: function() {
        this.game = null;
        this.engine = null;
    },

    start: function() {

    },

    update: function() {

    },

    render: function() {

    }

});
