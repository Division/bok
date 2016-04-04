var GameView = require('./views/GameView');

// App router
module.exports = Backbone.Router.extend({

    routes: {
        '': 'loadTestLevel',
        'levels/:id': 'loadLevel'
    },

    /**
     * Load level
     */
    loadTestLevel: function() {
        new GameView({
            el: 'canvas'
            //level: require('game/SatanBokLevel')
        });
    },

    loadLevel: function(id) {
        new GameView({
            el: 'canvas',
            level: id
        });
    }

});
