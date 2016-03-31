/**
 * Created by Nikita Sidorenko on 3/13/16.
 */
var BaseEntity = require("game/base/BaseEntity");

/**
 * @class LevelGeometry
 */
module.exports = BaseEntity.extend({

    points: null,

    initialize: function(points) {
        this.points = points;
    },

    start: function() {
        var physics = this.engine.physics;
        var convex = physics.createConvex();
        for (var i = 0; i < this.points.length; i++) {
            var particle = physics.createParticle(this.points[i], 0);
            convex.addParticle(particle);
        }
        convex.updateBounds();
        convex.setStatic(true);
    }

});
