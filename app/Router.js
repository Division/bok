var GameView = require('./views/GameView');

// App router
module.exports = Backbone.Router.extend({

    routes: {
        '': 'loadTestLevel'
    },

    /**
     * Load level
     */
    loadTestLevel: function(){ new GameView({
        el: '#canvas',
        level: require('game/SatanBokLevel')
    }); }

});
