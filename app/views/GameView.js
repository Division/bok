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

    /**
     * Init game and start render level
     *
     * @param {Object} attrs { level: 'Level' }
     */
    initialize: function (attrs) {
        this.render(attrs.level);
    },

    /**
     * Load engine and game level
     *
     * @param {Level} Level
     */
    render: function (Level) {
        this.level = new Level(this.el);
    }

});

