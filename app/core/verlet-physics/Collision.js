/**
 * Created by Nikita Sidorenko on 3/15/16.
 */
var Class = require("Class");
var Point = require("./Point");

/**
 * @class Collision
 */
module.exports = Class.extend({

    physics: null,

    initialize: function(physics) {
        this.physics = physics;
    },

    collisionPoint: function(point, collisionInfo, ignoreConvexes) {
        for (var i = 0; i < this.physics.convexes.length; i++) {
            var convex = this.physics.convexes[i];

            if (ignoreConvexes.indexOf(convex) != -1) {
                continue;
            }

            if (this.physics.SWEEP_AND_PRUNE_ENABLED && point.x < convex.aabb.min.x) {
                break;
            }
            if ((this.physics.SWEEP_AND_PRUNE_ENABLED && point.x > convex.aabb.max.x) ||
                point.y > convex.aabb.max.y || point.y < convex.aabb.min.y) {
                continue;
            }

            if (this.collisionPointVsConvex(point, convex, collisionInfo)) {
                return true;
            }
        }

        return false;
    },

    collisionPointVsConvex: function(point, convex, collisionInfo) {
        var minDistance = 1000000;
        var collisionNormal = null;

        for (var i = 0; i < convex.particles.length; i++) {
            var particle1 = convex.particles[i],
                particle2 = convex.particles[(i + 1) % convex.particles.length],
                p1 = particle1.position,
                p2 = particle2.position,
                normal = new Point(p1.y - p2.y, p2.x - p1.x).normalize();

            var pointToLineDistance = normal.dot(Point.subtract(p2, point));

            if (pointToLineDistance > 0) {
                return false;
            }

            if (Math.abs(pointToLineDistance) < minDistance) {
                minDistance = Math.abs(pointToLineDistance);
                collisionNormal = normal;
            }
        }

        collisionInfo.point = point;
        collisionInfo.depth = minDistance;
        collisionInfo.normal = collisionNormal;

        return true;
    }

});
