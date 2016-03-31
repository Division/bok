var Game = require("../game/Game");

/**
 * Here we load the game levels
 *
 * @type {void|*|Object}
 */
module.exports = Backbone.View.extend({

    /**
     * @type {Level} - Link to game level
     */
    level: null,

    game: null,

    /**
     * Init game and start render level
     *
     * @param {Object} attrs { level: 'Level' }
     */
    initialize: function (attrs) {

        this.game = new Game(attrs);
    }

});

